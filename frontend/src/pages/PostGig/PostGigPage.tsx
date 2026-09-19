import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getAuthToken } from '../../services/api';
import { useAuth } from '../../services/context/AuthContext';
import { uploadFile, uploadImage } from '../../services/upload';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, Upload, Link as LinkIcon, FileText, CheckCircle } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface FileAttachmentItem {
  id: string;
  details: string;
  file_url: string;
  file_name: string;
  uploading: boolean;
  error?: string;
}

interface LinkAttachmentItem {
  id: string;
  details: string;
  url: string;
}

export function PostGigPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    budget: '',
    delivery_days: '',
    requirements: '',
    deliverables: '',
  });

  const [fileAttachments, setFileAttachments] = useState<FileAttachmentItem[]>([]);
  const [linkAttachments, setLinkAttachments] = useState<LinkAttachmentItem[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/gigs/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ── File Attachments Handlers ─────────────────────────────────────
  const addFileItem = () => {
    const newItem: FileAttachmentItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      details: '',
      file_url: '',
      file_name: '',
      uploading: false,
    };
    setFileAttachments((prev) => [...prev, newItem]);
  };

  const removeFileItem = (id: string) => {
    setFileAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleFileDetailsChange = (id: string, details: string) => {
    setFileAttachments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, details } : item))
    );
  };

  const handleFileUploadSelect = async (id: string, file: File) => {
    setFileAttachments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, uploading: true, error: undefined } : item))
    );

    try {
      const isImage = file.type.startsWith('image/');
      const res = isImage ? await uploadImage(file, 'unigigs/gigs') : await uploadFile(file, 'unigigs/gigs');

      setFileAttachments((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                file_url: res.url,
                file_name: file.name,
                uploading: false,
              }
            : item
        )
      );
    } catch (err: any) {
      console.error('Upload failed:', err);
      setFileAttachments((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                uploading: false,
                error: 'Upload failed. Please try again.',
              }
            : item
        )
      );
    }
  };

  // ── Link Attachments Handlers ─────────────────────────────────────
  const addLinkItem = () => {
    const newItem: LinkAttachmentItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      details: '',
      url: '',
    };
    setLinkAttachments((prev) => [...prev, newItem]);
  };

  const removeLinkItem = (id: string) => {
    setLinkAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLinkChange = (id: string, field: 'details' | 'url', value: string) => {
    setLinkAttachments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // ── Submit Handler ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if any file is still uploading
    if (fileAttachments.some((item) => item.uploading)) {
      alert('Please wait for file uploads to finish before submitting.');
      return;
    }

    setLoading(true);

    try {
      // Build attachments payload
      const validFiles = fileAttachments
        .filter((item) => item.file_url)
        .map((item) => ({
          file_url: item.file_url,
          file_name: item.file_name || 'Attached File',
          description: item.details,
          file_type: 'file',
        }));

      const validLinks = linkAttachments
        .filter((item) => item.url.trim())
        .map((item) => ({
          file_url: item.url.trim(),
          file_name: item.details || item.url.trim(),
          description: item.details,
          file_type: 'link',
        }));

      const attachmentsPayload = [...validFiles, ...validLinks];

      const response = await fetch(`${API_BASE_URL}/gigs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category_id: Number(formData.category_id),
          budget: Number(formData.budget),
          delivery_days: Number(formData.delivery_days),
          requirements: formData.requirements,
          deliverables: formData.deliverables,
          attachments: attachmentsPayload,
        }),
      });

      if (response.ok) {
        alert('Gig posted successfully! 🎉');
        navigate('/dashboard');
      } else {
        const error = await response.json();
        let errorMsg = 'Failed to post gig';
        if (typeof error.detail === 'string') {
          errorMsg = error.detail;
        } else if (Array.isArray(error.detail)) {
          errorMsg = error.detail.map((e: any) => `${e.loc?.slice(1).join('.') || 'field'}: ${e.msg}`).join('\n');
        } else if (error.message) {
          errorMsg = error.message;
        }
        alert(errorMsg);
      }
    } catch (error: any) {
      console.error('Error posting gig:', error);
      alert(error.message || 'Failed to post gig. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is client
  if (user?.role !== 'client') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">
          Only clients can post gigs
        </h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          Please login as a client to access this page
        </p>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Post a New Gig</h1>
        <p className="text-[var(--color-text-muted)]">
          Describe your project and find the perfect student freelancer
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-lg">Basic Information</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Gig Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Logo Design for College Event"
                    required
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Category *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your project in detail..."
                    required
                    rows={8}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Requirements & Deliverables */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-lg">Project Details</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Requirements
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="What skills or experience do you need?"
                    rows={4}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Deliverables
                  </label>
                  <textarea
                    name="deliverables"
                    value={formData.deliverables}
                    onChange={handleChange}
                    placeholder="What will the freelancer deliver?"
                    rows={4}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Relevant Images & Files Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <FileText size={20} className="text-[var(--color-primary)]" />
                    Relevant Images & Files
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Upload reference images, mockups, guidelines or project specs (PNG, JPG, PDF, DOCX)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addFileItem}
                  className="flex items-center gap-1 text-xs"
                >
                  <Plus size={16} />
                  Add File / Image
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fileAttachments.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-[var(--color-border)] rounded-xl">
                    <p className="text-sm text-[var(--color-text-muted)]">No files or images added yet.</p>
                    <button
                      type="button"
                      onClick={addFileItem}
                      className="mt-2 text-xs font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
                    >
                      <Plus size={14} /> Click to add relevant images or files
                    </button>
                  </div>
                ) : (
                  fileAttachments.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] space-y-3 relative"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
                          File / Image #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFileItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1 transition-colors"
                          title="Remove file"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        {/* Field 1: Details of File/Image */}
                        <div>
                          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                            Details / Description of File
                          </label>
                          <input
                            type="text"
                            value={item.details}
                            onChange={(e) => handleFileDetailsChange(item.id, e.target.value)}
                            placeholder="e.g. Wireframe mockup sketch / Brand guidelines"
                            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          />
                        </div>

                        {/* Field 2: Actual Upload Field */}
                        <div>
                          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                            Upload File / Image
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileUploadSelect(item.id, e.target.files[0]);
                                }
                              }}
                              disabled={item.uploading}
                              className="w-full text-xs text-[var(--color-text-muted)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:opacity-90 cursor-pointer"
                            />
                          </div>

                          {item.uploading && (
                            <p className="text-xs text-amber-500 mt-1.5 flex items-center gap-1">
                              <Upload size={13} className="animate-spin" /> Uploading to cloud...
                            </p>
                          )}

                          {item.file_url && !item.uploading && (
                            <p className="text-xs text-emerald-500 mt-1.5 flex items-center gap-1 font-medium truncate">
                              <CheckCircle size={13} /> {item.file_name || 'Uploaded successfully'}
                            </p>
                          )}

                          {item.error && (
                            <p className="text-xs text-red-500 mt-1.5 font-medium">{item.error}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Relevant Links Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <LinkIcon size={20} className="text-[var(--color-primary)]" />
                    Relevant Links
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Add external website links, Figma design boards, Github repos, or reference URLs
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addLinkItem}
                  className="flex items-center gap-1 text-xs"
                >
                  <Plus size={16} />
                  Add Link
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {linkAttachments.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-[var(--color-border)] rounded-xl">
                    <p className="text-sm text-[var(--color-text-muted)]">No relevant links added yet.</p>
                    <button
                      type="button"
                      onClick={addLinkItem}
                      className="mt-2 text-xs font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
                    >
                      <Plus size={14} /> Click to add reference link
                    </button>
                  </div>
                ) : (
                  linkAttachments.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] space-y-3 relative"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
                          Link #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLinkItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1 transition-colors"
                          title="Remove link"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        {/* Field 1: Details of Link */}
                        <div>
                          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                            Link Description / Title
                          </label>
                          <input
                            type="text"
                            value={item.details}
                            onChange={(e) => handleLinkChange(item.id, 'details', e.target.value)}
                            placeholder="e.g. Reference website layout / Figma Prototype"
                            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          />
                        </div>

                        {/* Field 2: Actual Link URL Section */}
                        <div>
                          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                            Link URL
                          </label>
                          <input
                            type="url"
                            value={item.url}
                            onChange={(e) => handleLinkChange(item.id, 'url', e.target.value)}
                            placeholder="https://example.com/reference"
                            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Budget & Timeline */}
            <Card className="sticky top-24">
              <CardHeader>
                <h3 className="font-semibold">Budget & Timeline</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Budget (₹) *
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="e.g., 500"
                    required
                    min="100"
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Delivery Time (days) *
                  </label>
                  <input
                    type="number"
                    name="delivery_days"
                    value={formData.delivery_days}
                    onChange={handleChange}
                    placeholder="e.g., 5"
                    required
                    min="1"
                    max="30"
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div className="pt-4 border-t border-[var(--color-border)]">
                  <Button type="submit" fullWidth disabled={loading}>
                    {loading ? 'Posting...' : 'Post Gig'}
                  </Button>
                  <Button type="button" variant="ghost" fullWidth className="mt-2">
                    Save as Draft
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Tips for a Great Gig</h3>
              </CardHeader>
              <CardContent className="text-sm text-[var(--color-text-muted)] space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Be clear about your requirements</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Set a realistic budget</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Attach sample files or reference links</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Set reasonable delivery time</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}