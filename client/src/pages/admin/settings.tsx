import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMovies } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function AdminSettings() {
  const { awsConfig, updateAwsConfig } = useMovies();
  const { toast } = useToast();
  const [formData, setFormData] = useState(awsConfig);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateAwsConfig(formData);
    toast({
        title: "Settings Saved",
        description: "Your AWS configuration has been updated.",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-white">AWS Configuration</h1>
          <p className="text-gray-400 mt-2">Configure your connection to Amazon Web Services.</p>
        </div>

        <Card className="bg-card border-white/10">
            <CardHeader>
                <CardTitle className="text-white">S3 & CloudFront Credentials</CardTitle>
                <CardDescription className="text-gray-400">
                    These keys are used to list buckets and trigger transcoding jobs.
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
                        placeholder="•••••••••••••••••••••"
                    />
                </div>
            </CardContent>
        </Card>

        <Card className="bg-card border-white/10">
            <CardHeader>
                <CardTitle className="text-white">Bucket Configuration</CardTitle>
                <CardDescription className="text-gray-400">
                    Where your raw video files are stored.
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
                    Content Delivery Network settings for streaming.
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
                </div>
            </CardContent>
        </Card>

        <div className="flex justify-end">
            <Button onClick={handleSave} size="lg" className="bg-primary hover:bg-primary/90">
                Save Configuration
            </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
