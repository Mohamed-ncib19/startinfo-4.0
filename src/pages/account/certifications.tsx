import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Award, Calendar, Hash, User, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';

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
  const { user } = useAuth();
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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to download certificates');
      }

      const response = await fetch(`${API_BASE_URL}/api/certificates/${certificateId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to download certificate' }));
        throw new Error(errorData.message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert(error instanceof Error ? error.message : 'Failed to download certificate');
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
      <div className="text-center mb-8">
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src="/images/startinfo-logo.jpg" 
            alt="StartInfo" 
            className="h-28 mx-auto"
          />
        </motion.div>
        <motion.h1 
          className="text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          My Certifications
        </motion.h1>
        <motion.p 
          className="text-muted-foreground mt-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Welcome back, <b> {user?.name}</b>! Here are all your earned certificates.
        </motion.p>
      </div>

      <motion.div 
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Filter by course name..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-64 shadow-sm"
          />
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-sm mr-2">Sort by:</label>
          <select
            className="border rounded-md px-3 py-1.5 bg-white shadow-sm"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc')}
          >
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
            <option value="name-asc">Course Name (A-Z)</option>
            <option value="name-desc">Course Name (Z-A)</option>
          </select>
        </div>
      </motion.div>

      <AnimatePresence>
        {filteredCertificates.length === 0 ? (
          <motion.div 
            className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Award className="w-16 h-16 mx-auto text-primary/20 mb-4" />
            <p className="text-muted-foreground">No certificates match your criteria.</p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {filteredCertificates.map(cert => (
              <motion.div
                key={cert.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full overflow-hidden hover:border-primary/20">
                  <CardHeader className="border-b bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-primary">{cert.course.title}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">{cert.course.description}</CardDescription>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="ml-2 shrink-0 bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        {cert.course.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">Issue Date</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(cert.issuedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">Credential ID</div>
                            <div className="text-sm text-muted-foreground truncate" title={cert.certificateNumber}>
                              {cert.certificateNumber}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">Issued To</div>
                          <div className="text-sm text-muted-foreground">{cert.userName}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-6 border-t mt-auto bg-gray-50/50">
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
                    <Button variant="secondary" className="flex items-center gap-2" onClick={() => { setSelectedCert(cert); setShowModal(true); }}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificate Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Certificate Details</DialogTitle>
            <DialogDescription>Details for your selected certificate.</DialogDescription>
          </DialogHeader>
          {selectedCert && (
            <motion.div 
              className="space-y-6 py-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative p-12 border-8 border-double rounded-lg bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-blue-50">
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-primary/30 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-primary/30 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-primary/30 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-primary/30 rounded-br-lg" />
                
                <div className="relative">
                  {/* Logo */}
                  <div className="flex justify-center mb-6">
                    <img 
                      src="/images/startinfo-logo.jpg" 
                      alt="StartInfo Logo" 
                      className="h-16 object-contain"
                    />
                  </div>

                  {/* Certificate content */}
                  <div className="text-center space-y-8">
                    <div>
                      <h2 className="text-3xl font-serif text-primary mb-2">Certificate of Completion</h2>
                      <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    </div>

                    <div className="space-y-4">
                      <p className="text-lg text-muted-foreground">This is to certify that</p>
                      <h3 className="text-4xl font-serif font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        {user?.name || selectedCert.userName}
                      </h3>
                      <p className="text-lg text-muted-foreground">has successfully completed the course</p>
                      <h4 className="text-2xl font-semibold text-primary">
                        {selectedCert.course.title}
                      </h4>
                      <p className="text-gray-600 max-w-lg mx-auto">
                        {selectedCert.course.description}
                      </p>
                    </div>

                    <div className="pt-8 space-y-4">
                      <div className="flex justify-center items-center gap-8">
                        <Award className="w-12 h-12 text-primary/80" />
                        <div className="h-16 w-0.5 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
                        <div className="text-left">
                          <p className="text-sm text-muted-foreground">Certificate Number</p>
                          <p className="font-mono text-primary">{selectedCert.certificateNumber}</p>
                        </div>
                        <div className="h-16 w-0.5 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
                        <div className="text-left">
                          <p className="text-sm text-muted-foreground">Issue Date</p>
                          <p className="font-mono text-primary">
                            {new Date(selectedCert.issuedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-center pt-4">
                        <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                      </div>
                      <p className="text-sm text-muted-foreground">Digital Signature</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  className="hover:bg-primary/5"
                  onClick={() => downloadCertificate(selectedCert.id)}
                >
                  <Download className="h-4 w-4 mr-2" /> Download Certificate
                </Button>
                <Button 
                  variant="outline"
                  className="hover:bg-primary/5" 
                  onClick={() => {
                    navigator.share?.({
                      title: 'My Course Certificate',
                      text: `I've completed the ${selectedCert.course.title} course!`,
                      url: `${window.location.origin}/certificates/${selectedCert.id}`
                    }).catch(console.error);
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Certifications;