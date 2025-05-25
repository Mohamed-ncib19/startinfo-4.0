import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/use-toast';

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

export default function CertificatesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your certificates');
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/certificates/my-certificates', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Log the response data for debugging
        console.log('API Response:', response.data);
        
        // Ensure we're setting an array
        const certificatesData = Array.isArray(response.data) ? response.data : [];
        
        setCertificates(certificatesData);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            setError('Please log in to view your certificates');
          } else {
            setError(error.response?.data?.error || 'Failed to load certificates. Please try again later.');
          }
        } else {
          setError('Failed to load certificates. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const handleDownload = async (certificateId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Error',
          description: 'Please log in to download certificates',
          variant: 'destructive'
        });
        return;
      }

      const response = await axios.get(`/api/certificates/${certificateId}/download`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to download certificate. Please try again later.',
        variant: 'destructive'
      });
    }
  };

  const handleShare = async (certificate: Certificate) => {
    const verificationUrl = `${window.location.origin}/verify/${certificate.certificateNumber}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${certificate.course.title} Certificate`,
          text: `Check out my certificate for completing ${certificate.course.title}!`,
          url: verificationUrl
        });
      } catch (error) {
        console.error('Error sharing certificate:', error);
        // Don't show error for user cancellation
        if (error instanceof Error && error.name !== 'AbortError') {
          toast({
            title: 'Error',
            description: 'Failed to share certificate. Please try again later.',
            variant: 'destructive'
          });
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(verificationUrl);
        toast({
          title: 'Success',
          description: 'Verification link copied to clipboard!'
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast({
          title: 'Error',
          description: 'Failed to copy verification link. Please try again later.',
          variant: 'destructive'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading certificates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Certificates</h1>
      
      {!Array.isArray(certificates) || certificates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">You haven't earned any certificates yet.</p>
            <p className="text-gray-500 mt-2">Complete courses to earn certificates!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <Card key={certificate.id}>
              <CardHeader>
                <CardTitle>{certificate.course.title}</CardTitle>
                <CardDescription>
                  Certificate #{certificate.certificateNumber}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Issued on {new Date(certificate.issuedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(certificate.id)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(certificate)}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 