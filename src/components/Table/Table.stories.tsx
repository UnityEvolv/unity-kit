import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table } from "./Table";
import type { TableColumn, TableProps, TableRowKey, TableSort } from "./Table";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { EmptyState } from "../EmptyState";

interface Room {
  id: number;
  name: string;
  floor: string;
  seats: number;
  status: "open" | "busy" | "closed";
}

const rooms: Room[] = [
  { id: 1, name: "Reception", floor: "Ground", seats: 4, status: "open" },
  { id: 2, name: "Boardroom", floor: "First", seats: 12, status: "busy" },
  { id: 3, name: "Break room", floor: "Ground", seats: 8, status: "open" },
  { id: 4, name: "Focus pod A", floor: "Second", seats: 1, status: "closed" },
  { id: 5, name: "Focus pod B", floor: "Second", seats: 1, status: "open" },
];

const tone = { open: "primary", busy: "danger", closed: "ghost" } as const;

const columns: TableColumn<Room>[] = [
  { key: "name", header: "Room", sortable: true, card: "title" },
  { key: "floor", header: "Floor", sortable: true },
  { key: "seats", header: "Seats", align: "end", sortable: true },
  {
    key: "status",
    header: "Status",
    cell: (room) => <Badge variant={tone[room.status]}>{room.status}</Badge>,
  },
];

const rowKey = (room: Room) => room.id;

/**
 * Storybook cannot instantiate a generic component type, so the stories go
 * through a wrapper fixed to the Room type. Consumers call Table directly.
 */
const RoomTable = (props: TableProps<Room>) => <Table {...props} />;

const meta = {
  title: "Data/Table",
  component: RoomTable,
  tags: ["autodocs"],
  argTypes: {
    layout: {
      control: "inline-radio",
      options: ["auto", "table", "cards"],
      description:
        "auto follows (pointer: coarse): a touch device gets cards, a mouse gets rows. Resize does nothing; input mode is what decides.",
    },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg"] },
  },
  args: {
    caption: "Rooms",
    columns,
    rows: rooms,
    rowKey,
    layout: "auto",
  },
} satisfies Meta<typeof RoomTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Cards on a phone or tablet, rows with a mouse. Try it from each. */
export const Auto: Story = {};

export const ForcedTable: Story = { args: { layout: "table" } };

export const ForcedCards: Story = { args: { layout: "cards" } };

export const ZebraAndPinnedHeader: Story = {
  args: {
    layout: "table",
    zebra: true,
    pinHeader: true,
    rows: [...rooms, ...rooms, ...rooms],
  },
  render: (args) => (
    <div className="h-64 overflow-y-auto rounded-box border border-base-300">
      <Table {...args} />
    </div>
  ),
};

/** The caller sorts. The table only reports what was asked for and draws the indicator. */
const SortedExample = (args: Story["args"]) => {
  const [sort, setSort] = useState<TableSort>({
    key: "name",
    direction: "asc",
  });
  const sorted = [...rooms].sort((a, b) => {
    const key = sort.key as keyof Room;
    const order = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
    return sort.direction === "asc" ? order : -order;
  });
  return (
    <Table
      columns={columns}
      rowKey={rowKey}
      {...args}
      rows={sorted}
      sort={sort}
      onSortChange={setSort}
    />
  );
};

export const Sortable: Story = {
  render: (args) => <SortedExample {...args} />,
};

const SelectableExample = (args: Story["args"]) => {
  const [selected, setSelected] = useState<TableRowKey[]>([2]);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">{selected.length} selected</p>
      <Table
        columns={columns}
        rowKey={rowKey}
        rows={rooms}
        {...args}
        selectable
        selected={selected}
        onSelectionChange={setSelected}
      />
    </div>
  );
};

/** Selection is controlled and behaves the same in both layouts. */
export const Selectable: Story = {
  render: (args) => <SelectableExample {...args} />,
};

/**
 * The title cell becomes a real button, so the keyboard and a screen reader
 * get the same action a pointer gets from clicking anywhere on the row.
 */
export const RowClick: Story = {
  args: { onRowClick: (room) => alert(`Open ${room.name}`) },
};

export const Loading: Story = { args: { loading: true } };

export const Empty: Story = { args: { rows: [] } };

export const CustomEmpty: Story = {
  args: {
    rows: [],
    empty: (
      <EmptyState
        icon="office"
        title="No rooms yet"
        description="Create a room and invite your team."
        action={<Button icon="plus">New room</Button>}
      />
    ),
  },
};

export const Error: Story = {
  args: {
    error: "The rooms service did not answer.",
    onRetry: () => alert("retry"),
  },
};

/** The whole set in each forced layout, for a side by side check in both themes. */
export const SideBySide: Story = {
  render: (args) => (
    <div className="grid gap-6 lg:grid-cols-2">
      <Table
        {...args}
        layout="table"
        selectable
        selected={[1]}
        onRowClick={() => {}}
      />
      <Table
        {...args}
        layout="cards"
        selectable
        selected={[1]}
        onRowClick={() => {}}
      />
    </div>
  ),
};
