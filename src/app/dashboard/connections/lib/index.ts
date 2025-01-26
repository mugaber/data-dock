export interface ConnectionCardProps {
  id: string;
  name: string;
  type: "forecast" | "intect" | "planday";
  onEdit: () => void;
}

export const connections: ConnectionCardProps[] = [
  {
    id: "1",
    name: "Forecast connection",
    type: "forecast",
    onEdit: () => {},
  },
  {
    id: "2",
    name: "Intect connection",
    type: "intect",
    onEdit: () => {},
  },
  {
    id: "3",
    name: "Planday connection",
    type: "planday",
    onEdit: () => {},
  },
];
