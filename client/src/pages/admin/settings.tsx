import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AwsStatus {
  configured: boolean;
  region?: string;
  bucketName?: string;
  cloudfrontDomain?: string;
  accessKeyId?: string;
  message?: string;
}

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [awsStatus, setAwsStatus] = useState<AwsStatus | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/aws-status');
      if (response.ok) {
        const data = await response.json();
        setAwsStatus(data);
      }
    } catch (error) {
      console.error('Failed to load AWS status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const isConfigured = awsStatus?.configured || false;

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-white">AWS Configuration</h1>
          <p className="text-gray-400 mt-2">View your AWS connection status and configuration.</p>
        </div>

        <Card className="bg-card border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  AWS Service Status
                  {isConfigured ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      <XCircle className="w-3 h-3 mr-1" />
                      Not Configured
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  {isConfigured 
                    ? 'AWS services are configured and ready for video uploads and streaming.'
                    : 'AWS credentials need to be configured via Replit Secrets.'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!isConfigured && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-400 mb-2">AWS Configuration Required</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      To enable video uploads and streaming, add the following secrets in the Replit Secrets panel:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 font-mono">•</span>
                        <span><strong className="font-mono">AWS_ACCESS_KEY_ID</strong> - Your AWS access key</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 font-mono">•</span>
                        <span><strong className="font-mono">AWS_SECRET_ACCESS_KEY</strong> - Your AWS secret key</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 font-mono">•</span>
                        <span><strong className="font-mono">AWS_REGION</strong> - AWS region (e.g., us-east-1)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 font-mono">•</span>
                        <span><strong className="font-mono">AWS_S3_BUCKET_NAME</strong> - Your S3 bucket name</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 font-mono">•</span>
                        <span><strong className="font-mono">AWS_CLOUDFRONT_DOMAIN</strong> - CloudFront domain (e.g., d2mcz61iafdmct.cloudfront.net)</span>
                      </li>
                    </ul>
                    <p className="text-sm text-gray-400 mt-3">
                      After adding these secrets, restart the application for the changes to take effect.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {isConfigured && awsStatus && (
          <>
            <Card className="bg-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">S3 Bucket Configuration</CardTitle>
                <CardDescription className="text-gray-400">
                  Your S3 bucket stores uploaded videos and triggers Lambda transcoding.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Bucket Name</p>
                    <p className="text-white font-mono">{awsStatus.bucketName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Region</p>
                    <p className="text-white font-mono">{awsStatus.region}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Access Key ID</p>
                  <p className="text-white font-mono">{awsStatus.accessKeyId}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">CloudFront Distribution</CardTitle>
                <CardDescription className="text-gray-400">
                  Videos are delivered via CloudFront for optimal streaming performance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Domain</p>
                  <p className="text-white font-mono">{awsStatus.cloudfrontDomain}</p>
                </div>
                <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    <strong className="text-blue-400">HLS URL Pattern:</strong><br/>
                    <span className="font-mono text-xs">https://{awsStatus.cloudfrontDomain}/assets/[video-id]/HLS/[filename].m3u8</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Video Processing Workflow</CardTitle>
                <CardDescription className="text-gray-400">
                  Automated adaptive bitrate transcoding via AWS Lambda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Upload to S3</p>
                      <p className="text-sm text-gray-400">Videos uploaded to <span className="font-mono">inputs/[video-id]/[filename]</span></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Lambda Triggers MediaConvert</p>
                      <p className="text-sm text-gray-400">Automatic transcoding to adaptive bitrate HLS (1080p, 720p, 480p, 360p, 240p)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Output to CloudFront</p>
                      <p className="text-sm text-gray-400">HLS manifests served via CloudFront for adaptive streaming</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
