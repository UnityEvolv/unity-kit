import type { StorybookConfig } from '@storybook/react-vite'
import tailwindcss from '@tailwindcss/vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-themes', '@storybook/addon-docs'],
  framework: { name: '@storybook/react-vite', options: {} },

  /**
   * Storybook inherits the project's vite.config.ts, which is a library build: it
   * externalises React and emits declarations. Both are wrong for an app bundle, so the
   * library-only pieces are stripped here and Tailwind is added for the preview CSS.
   */
  viteFinal: async (config) => {
    const libraryOnly = ['unitykit:copy-theme', 'vite:dts']
    config.plugins = (config.plugins ?? []).filter((plugin) => {
      const name =
        plugin && typeof plugin === 'object' && 'name' in plugin ? String(plugin.name) : ''
      return !libraryOnly.includes(name)
    })
    config.plugins.push(tailwindcss())

    if (config.build) {
      delete config.build.lib
      if (config.build.rollupOptions) delete config.build.rollupOptions.external
    }
    return config
  },
}

export default config
