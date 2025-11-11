import { Eye, Download } from "lucide-react";

interface MaterialStatsProps {
  viewCount: number;
  downloadCount: number;
}

export function MaterialStats({ viewCount, downloadCount }: MaterialStatsProps) {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Eye className="h-4 w-4" />
        <span>{viewCount}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <Download className="h-4 w-4" />
        <span>{downloadCount}</span>
      </div>
    </div>
  );
}
