export interface IntegrationCardProps {
  id: string;
  name: string;
  type: string;
  onEdit: () => void;
  updatedIntegrations?: string[];
}

export const integrations: IntegrationCardProps[] = [
  {
    id: "1",
    name: "forecast",
    type: "Project Management",
    onEdit: () => {},
  },
  {
    id: "2",
    name: "intect",
    type: "Payroll",
    onEdit: () => {},
  },
  {
    id: "3",
    name: "planday",
    type: "Workforce Management",
    onEdit: () => {},
  },
];
