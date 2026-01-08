"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle, Copy, AlertCircle } from "lucide-react";

interface SurveyControlPanelProps {
  surveyEnabled: boolean;
  setSurveyEnabled: (enabled: boolean) => void;
  surveyLink: string;
}

export function SurveyControlPanel({
  surveyEnabled,
  setSurveyEnabled,
  surveyLink,
}: SurveyControlPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleToggle = (enabled: boolean) => {
    setSurveyEnabled(enabled);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(surveyLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Card className="m-6 mt-16">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📋 Quản lý Khảo sát
        </CardTitle>
        <CardDescription>
          Kiểm soát quyền truy cập khảo sát tư tưởng cho binh sĩ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Survey Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-base font-semibold">
                Cho phép truy cập khảo sát
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {surveyEnabled ? "✓ Khảo sát đang được kích hoạt" : "✗ Khảo sát bị vô hiệu hóa"}
              </p>
            </div>
            <Switch
              checked={surveyEnabled}
              onCheckedChange={handleToggle}
              className="ml-4"
            />
          </div>

          {/* Survey Link Display */}
          {surveyEnabled && (
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Liên kết Khảo sát
              </Label>
              <p className="text-sm text-muted-foreground">
                Chia sẻ liên kết này với binh sĩ để họ có thể làm khảo sát:
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={surveyLink}
                  readOnly
                  className="font-mono text-sm bg-background"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="whitespace-nowrap"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Disabled State Message */}
          {!surveyEnabled && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Khảo sát hiện bị vô hiệu hóa
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  Binh sĩ sẽ không thể truy cập vào khảo sát cho đến khi bạn kích hoạt nó.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
