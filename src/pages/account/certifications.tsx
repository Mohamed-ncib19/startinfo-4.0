import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Certificate {
  id: number;
  certificateNumber: string;
  issuedAt: string;
  course: {
    title: string;
    description: string;
    level: string;
  };
}

const API_BASE_URL = 'http://localhost:5000';

const Certifications = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/certificates`);
        if (!response.ok) {
          throw new Error('Failed to fetch certificates');
        }
        const data = await response.json();
        setCertificates(data);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        setError('Failed to load certificates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const downloadCertificate = async (certificateId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/certificates/${certificateId}/download`);
      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You haven't earned any certificates yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {certificates.map((cert) => (
        <Card key={cert.id}>
          <CardHeader>
            <CardTitle>{cert.course.title}</CardTitle>
            <CardDescription>{cert.course.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Issue Date</div>
                  <div>{new Date(cert.issuedAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Credential ID</div>
                  <div>{cert.certificateNumber}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Level</div>
                <Badge variant="secondary">{cert.course.level}</Badge>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex items-center gap-2" onClick={() => downloadCertificate(cert.id)}>
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" className="flex items-center gap-2" onClick={() => {
                  navigator.share?.({
                    title: 'My Course Certificate',
                    text: `I've completed the ${cert.course.title} course!`,
                    url: `${window.location.origin}/certificates/${cert.id}`
                  }).catch(console.error);
                }}>
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Certifications;
