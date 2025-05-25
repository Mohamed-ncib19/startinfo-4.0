import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Certificate {
  id: number;
  certificateNumber: string;
  issuedAt: string;
  userName: string;
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
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'>('date-desc');
  const [filter, setFilter] = useState('');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/certificates/my-certificates`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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

  // Sorting and filtering logic
  const filteredCertificates = certificates
    .filter(cert => cert.course.title.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
      } else if (sortBy === 'date-asc') {
        return new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime();
      } else if (sortBy === 'name-asc') {
        return a.course.title.localeCompare(b.course.title);
      } else {
        return b.course.title.localeCompare(a.course.title);
      }
    });

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

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">My Certifications</h1>
      <p className="text-muted-foreground mb-6">All your earned certificates from completed courses are listed here. You can view, download, or share them.</p>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Filter by course name..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-sm mr-2">Sort by:</label>
          <select
            className="border rounded px-2 py-1"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
          >
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
            <option value="name-asc">Course Name (A-Z)</option>
            <option value="name-desc">Course Name (Z-A)</option>
          </select>
        </div>
      </div>
      {filteredCertificates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No certificates match your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCertificates.map((cert) => (
            <Card key={cert.id} className="flex flex-col justify-between h-full">
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
                    <div className="text-sm text-muted-foreground mb-2">Issued To</div>
                    <div className="font-medium">{cert.userName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Level</div>
                    <Badge variant="secondary">{cert.course.level}</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 mt-auto">
                <Button variant="outline" className="flex-1 flex items-center gap-2" onClick={() => downloadCertificate(cert.id)}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" className="flex-1 flex items-center gap-2" onClick={() => {
                  navigator.share?.({
                    title: 'My Course Certificate',
                    text: `I've completed the ${cert.course.title} course!`,
                    url: `${window.location.origin}/certificates/${cert.id}`
                  }).catch(console.error);
                }}>
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="secondary" className="flex-1 flex items-center gap-2" onClick={() => { setSelectedCert(cert); setShowModal(true); }}>
                  View
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {/* Certificate Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Certificate Details</DialogTitle>
            <DialogDescription>Details for your selected certificate.</DialogDescription>
          </DialogHeader>
          {selectedCert && (
            <div className="space-y-4 py-2 text-center">
              <h3 className="text-xl font-bold">{selectedCert.course.title}</h3>
              <p className="text-muted-foreground">{selectedCert.course.description}</p>
              <div className="border p-4 rounded-lg mt-2">
                <p className="font-semibold">Certificate of Completion</p>
                <p>This certifies that</p>
                <p className="text-lg font-semibold">{selectedCert.userName}</p>
                <p>has successfully completed the course</p>
                <p className="text-lg font-semibold">{selectedCert.course.title}</p>
                <p className="text-sm text-muted-foreground mt-2">Certificate #{selectedCert.certificateNumber}</p>
                <p className="text-sm text-muted-foreground">Issued on {new Date(selectedCert.issuedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 justify-center mt-4">
                <Button variant="outline" onClick={() => downloadCertificate(selectedCert.id)}>
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </Button>
                <Button variant="outline" onClick={() => {
                  navigator.share?.({
                    title: 'My Course Certificate',
                    text: `I've completed the ${selectedCert.course.title} course!`,
                    url: `${window.location.origin}/certificates/${selectedCert.id}`
                  }).catch(console.error);
                }}>
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Certifications;
