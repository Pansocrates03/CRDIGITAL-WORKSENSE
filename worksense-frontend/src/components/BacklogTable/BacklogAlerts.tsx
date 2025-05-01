// src/components/BacklogTable/BacklogAlerts.tsx
import { FC } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BacklogAlertsProps {
  successMessage?: string;
  errorMessage?: string;
}

const BacklogAlerts: FC<BacklogAlertsProps> = ({ successMessage, errorMessage }) => (
  <>
    {successMessage && (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300">
        <Alert variant="default" className="bg-[#ac1754] text-white border-none">
          <CheckCircle className="h-4 w-4 text-white" />
          <AlertDescription className="text-white">
            {successMessage}
          </AlertDescription>
        </Alert>
      </div>
    )}
    {errorMessage && (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300">
        <Alert variant="destructive" className="bg-red-600 text-white border-none">
          <AlertTriangle className="h-4 w-4 text-white" />
          <AlertDescription className="text-white">
            {errorMessage}
          </AlertDescription>
        </Alert>
      </div>
    )}
  </>
);

export default BacklogAlerts;