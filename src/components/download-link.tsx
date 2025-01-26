import Link from "next/link";
import { Button } from "./ui/button";

interface DownloadLinkProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fileUrl: string;
  fileName: string;
  children: React.ReactNode;
}

export function DownloadLink({
  fileUrl,
  fileName,
  children,
  ...props
}: DownloadLinkProps) {
  return (
    <Link
      href={fileUrl}
      download={fileName || fileUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Button {...props}>{children}</Button>
    </Link>
  );
}
