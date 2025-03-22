export interface IntegrationCardProps {
  id: string;
  name: string;
  type: string;
  comingSoon?: boolean;
  onEdit: () => void;
}

export const integrations: IntegrationCardProps[] = [
  {
    id: "1",
    name: "forecast",
    type: "Project Management",
    onEdit: () => {},
  },
  // {
  //   id: "2",
  //   name: "intect",
  //   type: "Payroll",
  //   onEdit: () => {},
  // },
  {
    id: "3",
    name: "shopify",
    type: "E-commerce",
    comingSoon: true,
    onEdit: () => {},
  },
];
