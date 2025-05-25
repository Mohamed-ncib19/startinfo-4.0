import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import axios from 'axios';

interface VerificationResult {
  valid: boolean;
  certificate?: {
    userName: string;
    courseName: string;
    issuedAt: string;
    certificateNumber: string;
  };
  error?: string;
}

export default function CertificateVerification() {
  const { certificateNumber } = useParams<{ certificateNumber: string }>();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        const response = await axios.get(`/api/certificates/verify/${certificateNumber}`);
        setResult(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          setResult(error.response.data);
        } else {
          setResult({ 
            valid: false, 
            error: 'Failed to verify certificate. Please try again later.' 
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (certificateNumber) {
      verifyCertificate();
    }
  }, [certificateNumber]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Verifying certificate...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Certificate Verification</CardTitle>
            {result?.valid ? (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            ) : (
              <XCircle className="w-8 h-8 text-red-500" />
            )}
          </div>
          <CardDescription>
            Certificate #{certificateNumber}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result?.valid ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Certificate Details</h3>
                <p>Name: {result.certificate?.userName}</p>
                <p>Course: {result.certificate?.courseName}</p>
                <p>Issued on: {new Date(result.certificate?.issuedAt || '').toLocaleDateString()}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-green-700">
                  This certificate has been verified and is authentic.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-700">
                {result?.error || 'This certificate could not be verified. It may be invalid or has been revoked.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 