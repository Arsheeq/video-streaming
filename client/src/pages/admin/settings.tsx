import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AwsConfigForm {
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
  cloudfrontDomain: string;
  mediaConvertEndpoint: string;
  mediaConvertRole: string;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AwsConfigForm>({
    accessKeyId: '',
    secretAccessKey: '',
    bucketName: '',
    region: 'us-east-1',
    cloudfrontDomain: '',
    mediaConvertEndpoint: '',
    mediaConvertRole: ''
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/aws-config');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          accessKeyId: data.accessKeyId || '',
          secretAccessKey: '',
          bucketName: data.bucketName || '',
          region: data.region || 'us-east-1',
          cloudfrontDomain: data.cloudfrontDomain || '',
          mediaConvertEndpoint: data.mediaConvertEndpoint || '',
          mediaConvertRole: data.mediaConvertRole || ''
        });
      }
    } catch (error) {
      console.error('Failed to load AWS config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/aws-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save configuration');
      }

      toast({
        title: "Settings Saved",
        description: "Your AWS configuration has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
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

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-white">AWS Configuration</h1>
          <p className="text-gray-400 mt-2">Configure your connection to Amazon Web Services for video streaming.</p>
        </div>

        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">AWS Credentials</CardTitle>
            <CardDescription className="text-gray-400">
              These keys are used to access S3, CloudFront, and MediaConvert services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="accessKeyId">Access Key ID</Label>
              <Input 
                id="accessKeyId" 
                name="accessKeyId"
                value={formData.accessKeyId}
                onChange={handleChange}
                className="bg-black/20 border-white/10 font-mono"
                placeholder="AKIA..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="secretAccessKey">Secret Access Key</Label>
              <Input 
                id="secretAccessKey" 
                name="secretAccessKey"
                type="password"
                value={formData.secretAccessKey}
                onChange={handleChange}
                className="bg-black/20 border-white/10 font-mono"
                placeholder="Leave empty to keep existing"
              />
              <p className="text-xs text-gray-500">
                For security, the secret key is never displayed. Leave empty to keep the existing key.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">S3 Bucket Configuration</CardTitle>
            <CardDescription className="text-gray-400">
              Your S3 bucket for storing video files (both input and output).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bucketName">S3 Bucket Name</Label>
                <Input 
                  id="bucketName" 
                  name="bucketName"
                  value={formData.bucketName}
                  onChange={handleChange}
                  className="bg-black/20 border-white/10"
                  placeholder="my-video-bucket"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="region">AWS Region</Label>
                <Input 
                  id="region" 
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="bg-black/20 border-white/10"
                  placeholder="us-east-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">CloudFront Settings</CardTitle>
            <CardDescription className="text-gray-400">
              Your CloudFront distribution domain for streaming videos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="cloudfrontDomain">CloudFront Domain</Label>
              <Input 
                id="cloudfrontDomain" 
                name="cloudfrontDomain"
                value={formData.cloudfrontDomain}
                onChange={handleChange}
                className="bg-black/20 border-white/10"
                placeholder="d1234abcd.cloudfront.net"
              />
              <p className="text-xs text-gray-500">
                This is where your transcoded HLS videos will be served from.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">MediaConvert Settings</CardTitle>
            <CardDescription className="text-gray-400">
              Configuration for AWS MediaConvert video transcoding service.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="mediaConvertEndpoint">MediaConvert Endpoint</Label>
              <Input 
                id="mediaConvertEndpoint" 
                name="mediaConvertEndpoint"
                value={formData.mediaConvertEndpoint}
                onChange={handleChange}
                className="bg-black/20 border-white/10 font-mono text-sm"
                placeholder="https://abc123.mediaconvert.us-east-1.amazonaws.com"
              />
              <p className="text-xs text-gray-500">
                Find this in AWS MediaConvert console under Account settings.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mediaConvertRole">MediaConvert IAM Role ARN</Label>
              <Input 
                id="mediaConvertRole" 
                name="mediaConvertRole"
                value={formData.mediaConvertRole}
                onChange={handleChange}
                className="bg-black/20 border-white/10 font-mono text-sm"
                placeholder="arn:aws:iam::123456789012:role/MediaConvertRole"
              />
              <p className="text-xs text-gray-500">
                IAM role that MediaConvert will use to access S3 buckets.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            size="lg" 
            className="bg-primary hover:bg-primary/90"
            disabled={saving}
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
