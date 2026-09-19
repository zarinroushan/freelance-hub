import { useEffect, useState } from 'react';
import { API_BASE_URL, getAuthToken } from '../../services/api';
import { useAuth } from '../../services/context/AuthContext';
import { uploadFile } from '../../services/upload';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Briefcase, Clock, DollarSign, CheckCircle, Package, Upload, Download, FileText, AlertCircle, RefreshCw, X } from 'lucide-react';

interface DeliverableItem {
  id: number;
  description: string;
  file_urls?: string[];
  submission_message?: string;
  submitted_at?: string;
}

interface Contract {
  id: number;
  gig_id: number;
  client_id: number;
  freelancer_id: number;
  agreed_budget: number;
  status: 'pending' | 'active' | 'submitted' | 'revision_requested' | 'completed' | 'cancelled';
  created_at: string;
  delivery_deadline: string;
  reviewed_by_me?: boolean;
  revision_feedback?: string | null;
  deliverables?: DeliverableItem[];
}

export function ContractsPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [submitModalContract, setSubmitModalContract] = useState<Contract | null>(null);
  const [viewSubmissionContract, setViewSubmissionContract] = useState<Contract | null>(null);
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  // Submit Work Form State (Freelancer)
  const [submissionDescription, setSubmissionDescription] = useState('');
  const [submissionFileUrl, setSubmissionFileUrl] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submittingWork, setSubmittingWork] = useState(false);

  // Revision Form State (Client inside View Submission modal)
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [submittingRevision, setSubmittingRevision] = useState(false);
  const [approvingPayment, setApprovingPayment] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Global Status Banner Message
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchContracts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContracts(data);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'revision_requested':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileUrls = (urls: any): string[] => {
    if (!urls) return [];
    if (Array.isArray(urls)) return urls;
    if (typeof urls === 'string') {
      try {
        const parsed = JSON.parse(urls);
        if (Array.isArray(parsed)) return parsed;
        return [parsed];
      } catch {
        return [urls];
      }
    }
    return [];
  };

  const handleDownloadFile = (url: string, filename: string = 'deliverable-file') => {
    if (!url) return;

    if (url.startsWith('data:')) {
      try {
        const parts = url.split(';base64,');
        const contentType = parts[0].replace('data:', '');
        const base64Data = atob(parts[1]);
        const arrayBuffer = new Uint8Array(base64Data.length);
        for (let i = 0; i < base64Data.length; i++) {
          arrayBuffer[i] = base64Data.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: contentType });
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } catch (e) {
        console.error('Data URL download error:', e);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
      }
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // ── Freelancer File Upload ─────────────────────────────────────────
  const handleFileUpload = async (file: File) => {
    setUploadingFile(true);
    try {
      const res = await uploadFile(file, 'unigigs/deliverables');
      setSubmissionFileUrl(res.url);
      setSubmissionFileName(file.name);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setStatusBanner({ type: 'error', msg: 'File upload failed. Please try again.' });
    } finally {
      setUploadingFile(false);
    }
  };

  // ── Freelancer Submit Work ─────────────────────────────────────────
  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitModalContract) return;

    if (!submissionDescription.trim()) {
      setStatusBanner({ type: 'error', msg: 'Please provide work submission details.' });
      return;
    }

    setSubmittingWork(true);

    try {
      const response = await fetch(`${API_BASE_URL}/contracts/${submitModalContract.id}/deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          description: submissionDescription.trim(),
          file_urls: submissionFileUrl ? [submissionFileUrl] : [],
          submission_message: submissionFileName ? `Attached file: ${submissionFileName}` : 'Deliverable submitted',
        }),
      });

      if (response.ok) {
        setStatusBanner({ type: 'success', msg: 'Work submitted successfully! Client notified.' });
        setSubmitModalContract(null);
        setSubmissionDescription('');
        setSubmissionFileUrl('');
        setSubmissionFileName('');
        await fetchContracts();
      } else {
        const errorData = await response.json();
        setStatusBanner({ type: 'error', msg: errorData.detail || 'Failed to submit work.' });
      }
    } catch (error: any) {
      console.error('Error delivering:', error);
      setStatusBanner({ type: 'error', msg: 'Failed to submit work. Please try again.' });
    } finally {
      setSubmittingWork(false);
    }
  };

  // ── Client Request Revision ───────────────────────────────────────
  const handleRequestRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewSubmissionContract) return;

    if (!revisionFeedback.trim()) {
      setStatusBanner({ type: 'error', msg: 'Please describe the revision details needed.' });
      return;
    }

    setSubmittingRevision(true);

    try {
      const response = await fetch(`${API_BASE_URL}/contracts/${viewSubmissionContract.id}/request-revision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ feedback: revisionFeedback.trim() }),
      });

      if (response.ok) {
        setStatusBanner({ type: 'success', msg: 'Revision request sent to the freelancer.' });
        setViewSubmissionContract(null);
        setShowRevisionInput(false);
        setRevisionFeedback('');
        await fetchContracts();
      } else {
        const errorData = await response.json();
        setStatusBanner({ type: 'error', msg: errorData.detail || 'Failed to request revision.' });
      }
    } catch (error: any) {
      console.error('Error requesting revision:', error);
      setStatusBanner({ type: 'error', msg: 'Failed to request revision. Please try again.' });
    } finally {
      setSubmittingRevision(false);
    }
  };

  // ── Client Approve Work & Pay ──────────────────────────────────────
  const handleApproveWork = async (contractId: number) => {
    setApprovingPayment(true);

    try {
      const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (response.ok) {
        setStatusBanner({ type: 'success', msg: 'Work approved! Payment released to freelancer. 🎉' });
        setViewSubmissionContract(null);
        await fetchContracts();
      } else {
        const errorData = await response.json();
        setStatusBanner({ type: 'error', msg: errorData.detail || 'Failed to approve work.' });
      }
    } catch (error) {
      console.error('Error approving:', error);
      setStatusBanner({ type: 'error', msg: 'Failed to approve work. Please try again.' });
    } finally {
      setApprovingPayment(false);
    }
  };

  // ── Submit Rating & Review ─────────────────────────────────────────
  const handleReview = async (contractId: number) => {
    setReviewLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          contract_id: contractId,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to submit review');
      }
      setStatusBanner({ type: 'success', msg: 'Review submitted successfully!' });
      setContracts((current) =>
        current.map((contract) =>
          contract.id === contractId ? { ...contract, reviewed_by_me: true } : contract
        )
      );
      setReviewingId(null);
      setReviewComment('');
      setReviewRating(5);
    } catch (error: any) {
      setStatusBanner({ type: 'error', msg: error.message || 'Failed to submit review.' });
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-lg font-medium text-[var(--color-text-muted)] flex items-center gap-2">
          <RefreshCw className="animate-spin" size={20} /> Loading contracts...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">My Contracts</h1>
        <p className="text-[var(--color-text-muted)] text-sm sm:text-base">
          Manage your active contracts, deliverables, and milestone approvals
        </p>
      </div>

      {/* Global Status Banner */}
      {statusBanner && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusBanner.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{statusBanner.msg}</span>
          </div>
          <button onClick={() => setStatusBanner(null)} className="p-1 hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl font-bold text-[var(--color-text)]">{contracts.length}</div>
            <div className="text-xs sm:text-sm text-[var(--color-text-muted)] font-medium">Total Contracts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl font-bold text-emerald-600">
              {contracts.filter((c) => c.status === 'active').length}
            </div>
            <div className="text-xs sm:text-sm text-[var(--color-text-muted)] font-medium">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600">
              {contracts.filter((c) => c.status === 'submitted').length}
            </div>
            <div className="text-xs sm:text-sm text-[var(--color-text-muted)] font-medium">Submitted for Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl font-bold text-purple-600">
              {contracts.filter((c) => c.status === 'completed').length}
            </div>
            <div className="text-xs sm:text-sm text-[var(--color-text-muted)] font-medium">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">No contracts yet</h3>
            <p className="text-[var(--color-text-muted)]">
              When you accept a gig or post one, active contracts will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <Card key={contract.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-[var(--color-primary)]/10 rounded-xl">
                      <Briefcase size={22} className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[var(--color-text)]">
                        Contract #{contract.id}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Created: {new Date(contract.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getStatusColor(
                      contract.status
                    )}`}
                  >
                    {contract.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <DollarSign size={18} className="text-[var(--color-primary)]" />
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] font-medium">Agreed Budget</p>
                      <p className="font-bold text-[var(--color-primary)]">₹{contract.agreed_budget}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={18} className="text-[var(--color-text-muted)]" />
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] font-medium">Delivery Deadline</p>
                      <p className="font-medium text-[var(--color-text)]">
                        {new Date(contract.delivery_deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package size={18} className="text-[var(--color-text-muted)]" />
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] font-medium">Gig ID</p>
                      <p className="font-medium text-[var(--color-text)]">#{contract.gig_id}</p>
                    </div>
                  </div>
                </div>

                {/* Revision Feedback alert if requested */}
                {contract.status === 'revision_requested' && contract.revision_feedback && (
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-sm text-purple-900 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800 mb-4">
                    <p className="font-bold flex items-center gap-1.5">
                      <RefreshCw size={15} /> Client requested revision:
                    </p>
                    <p className="mt-1 leading-relaxed">{contract.revision_feedback}</p>
                  </div>
                )}

                {/* Contract Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--color-border)]">
                  {/* Freelancer Submit / Resubmit Work Button */}
                  {(contract.status === 'active' || contract.status === 'revision_requested') &&
                    user?.role === 'student' && (
                      <Button
                        onClick={() => {
                          setSubmitModalContract(contract);
                          setSubmissionDescription('');
                          setSubmissionFileUrl('');
                          setSubmissionFileName('');
                        }}
                      >
                        <Upload size={16} className="mr-2" />
                        {contract.status === 'revision_requested' ? 'Resubmit Work' : 'Submit Work'}
                      </Button>
                    )}

                  {/* Client View Submission Button */}
                  {contract.status === 'submitted' && user?.role === 'client' && (
                    <Button
                      onClick={() => {
                        setViewSubmissionContract(contract);
                        setShowRevisionInput(false);
                        setRevisionFeedback('');
                      }}
                    >
                      <FileText size={16} className="mr-2" />
                      View Submission
                    </Button>
                  )}

                  {/* Student Review Button */}
                  {user?.role === 'student' &&
                    contract.freelancer_id === user.id &&
                    contract.status === 'completed' && (
                      contract.reviewed_by_me ? (
                        <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle size={14} className="mr-1.5" /> Review Submitted
                        </span>
                      ) : (
                        <Button
                          variant="secondary"
                          onClick={() => setReviewingId(reviewingId === contract.id ? null : contract.id)}
                        >
                          Leave a Review
                        </Button>
                      )
                    )}
                </div>

                {/* Review Form */}
                {reviewingId === contract.id && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Rating</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] font-medium"
                      >
                        {[5, 4, 3, 2, 1].map((r) => (
                          <option key={r} value={r}>
                            {r} Stars ⭐
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Feedback Comment</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        maxLength={2000}
                        rows={3}
                        placeholder="Share your experience working on this gig..."
                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] resize-none"
                      />
                    </div>
                    <Button onClick={() => handleReview(contract.id)} disabled={reviewLoading}>
                      {reviewLoading ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── MODAL 1: Freelancer Work Submission Modal ────────────────────── */}
      {submitModalContract && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[var(--color-border)]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
                <Upload size={20} className="text-[var(--color-primary)]" />
                Submit Contract Work
              </h2>
              <button
                type="button"
                onClick={() => setSubmitModalContract(null)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="p-6 space-y-5">
              {/* Field 1: Work Details / Description */}
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                  Work Details / Deliverable Description *
                </label>
                <textarea
                  value={submissionDescription}
                  onChange={(e) => setSubmissionDescription(e.target.value)}
                  placeholder="Describe what you completed, notes for the client, links, or file overview..."
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                />
              </div>

              {/* Field 2: File Upload Field */}
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                  Attach Deliverable File (ZIP, PDF, DOCX, Images)
                </label>
                <input
                  type="file"
                  accept=".zip,.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  disabled={uploadingFile}
                  className="w-full text-xs text-[var(--color-text-muted)] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:opacity-90 cursor-pointer"
                />

                {uploadingFile && (
                  <p className="text-xs text-amber-500 mt-2 flex items-center gap-1 font-medium">
                    <Upload size={14} className="animate-spin" /> Uploading file to cloud...
                  </p>
                )}

                {submissionFileUrl && !uploadingFile && (
                  <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1 font-semibold">
                    <CheckCircle size={14} /> Attached: {submissionFileName || 'File uploaded successfully'}
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSubmitModalContract(null)}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button type="submit" fullWidth disabled={submittingWork || uploadingFile}>
                  {submittingWork ? 'Submitting...' : 'Submit Work'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Client View Submission Modal ──────────────────────── */}
      {viewSubmissionContract && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-[var(--color-border)]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
                <FileText size={20} className="text-[var(--color-primary)]" />
                Submitted Work for Review
              </h2>
              <button
                type="button"
                onClick={() => setViewSubmissionContract(null)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Submission Content */}
              {viewSubmissionContract.deliverables && viewSubmissionContract.deliverables.length > 0 ? (
                viewSubmissionContract.deliverables.map((del, idx) => {
                  const urls = getFileUrls(del.file_urls);
                  return (
                    <div key={del.id || idx} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
                          Deliverable Submission #{idx + 1}
                        </span>
                        {del.submitted_at && (
                          <span className="text-xs text-[var(--color-text-muted)] font-medium">
                            {new Date(del.submitted_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {del.description && (
                        <div>
                          <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Freelancer Notes / Details:</p>
                          <p className="text-sm font-medium text-[var(--color-text)] whitespace-pre-line leading-relaxed">
                            {del.description}
                          </p>
                        </div>
                      )}
                      {urls.length > 0 && (
                        <div className="pt-2">
                          <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Attached Files:</p>
                          <div className="flex flex-col gap-2">
                            {urls.map((url, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleDownloadFile(url, `deliverable-file-${idx + 1}-${i + 1}`)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline cursor-pointer text-left w-fit"
                              >
                                <Download size={14} /> Download Deliverable File #{i + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                  <p className="text-sm text-[var(--color-text-muted)]">Work submitted by freelancer.</p>
                </div>
              )}

              {/* Revision Form Toggle inside Modal */}
              {showRevisionInput ? (
                <form onSubmit={handleRequestRevision} className="p-4 rounded-xl border border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800 space-y-3">
                  <label className="block text-sm font-bold text-purple-900 dark:text-purple-200">
                    Describe Required Revisions / Feedback *
                  </label>
                  <textarea
                    value={revisionFeedback}
                    onChange={(e) => setRevisionFeedback(e.target.value)}
                    placeholder="Specify exact changes or updates required from the freelancer..."
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowRevisionInput(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={submittingRevision}>
                      {submittingRevision ? 'Sending...' : 'Send Revision Request'}
                    </Button>
                  </div>
                </form>
              ) : null}

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--color-border)]">
                {!showRevisionInput && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowRevisionInput(true)}
                    fullWidth
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Request Revision
                  </Button>
                )}

                <Button
                  type="button"
                  onClick={() => handleApproveWork(viewSubmissionContract.id)}
                  disabled={approvingPayment}
                  fullWidth
                >
                  <CheckCircle size={16} className="mr-2" />
                  {approvingPayment ? 'Approving...' : 'Approve & Release Payment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}