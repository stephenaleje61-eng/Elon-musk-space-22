import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Star, 
  ShieldCheck, 
  Search, 
  Save, 
  Layers, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { ContentItem, SectionId, ProductStatus } from '../types';
import { SECTIONS } from '../data/seedData';
import { 
  createContentItem, 
  updateContentItem, 
  deleteContentItem, 
  togglePublishItem, 
  toggleFeaturedItem 
} from '../services/contentService';

interface AdminCMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ContentItem[];
}

export const AdminCMSModal: React.FC<AdminCMSModalProps> = ({
  isOpen,
  onClose,
  items
}) => {
  const [activeTab, setActiveTab] = useState<'catalogue' | 'create'>('catalogue');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  // Form states
  const [formSectionId, setFormSectionId] = useState<SectionId>('tesla-clean-energy');
  const [formCategory, setFormCategory] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCurrency, setFormCurrency] = useState('USD');
  const [formImages, setFormImages] = useState('');
  const [formSourceUrl, setFormSourceUrl] = useState('');
  const [formOfficialUrl, setFormOfficialUrl] = useState('');
  const [formStatus, setFormStatus] = useState<ProductStatus>('commercial');
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formSpecsRaw, setFormSpecsRaw] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEditClick = (item: ContentItem) => {
    setEditingItem(item);
    setFormSectionId(item.sectionId);
    setFormCategory(item.category);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormPrice(item.price || '');
    setFormCurrency(item.currency || 'USD');
    setFormImages(item.images.join(', '));
    setFormSourceUrl(item.sourceUrl || '');
    setFormOfficialUrl(item.officialUrl || '');
    setFormStatus(item.status);
    setFormIsPublished(item.isPublished);
    setFormIsFeatured(item.isFeatured);
    setFormSpecsRaw(Object.entries(item.specifications || {}).map(([k, v]) => `${k}: ${v}`).join('\n'));
    setActiveTab('create');
  };

  const handleResetForm = () => {
    setEditingItem(null);
    setFormSectionId('tesla-clean-energy');
    setFormCategory('');
    setFormTitle('');
    setFormDescription('');
    setFormPrice('');
    setFormCurrency('USD');
    setFormImages('');
    setFormSourceUrl('');
    setFormOfficialUrl('');
    setFormStatus('commercial');
    setFormIsPublished(true);
    setFormIsFeatured(false);
    setFormSpecsRaw('');
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) return;

    const specifications: Record<string, string> = {};
    formSpecsRaw.split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx > -1) {
        const k = line.substring(0, idx).trim();
        const v = line.substring(idx + 1).trim();
        if (k && v) specifications[k] = v;
      }
    });

    const images = formImages
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1517976487507-5b3b11329241?auto=format&fit=crop&w=1200&q=80');
    }

    try {
      if (editingItem) {
        await updateContentItem(editingItem.id, {
          sectionId: formSectionId,
          category: formCategory || 'General',
          title: formTitle,
          description: formDescription,
          price: formPrice || undefined,
          currency: formCurrency,
          images,
          sourceUrl: formSourceUrl || undefined,
          officialUrl: formOfficialUrl || undefined,
          status: formStatus,
          isPublished: formIsPublished,
          isFeatured: formIsFeatured,
          specifications
        });
        setFeedbackMsg('Content updated in Firestore!');
      } else {
        await createContentItem({
          sectionId: formSectionId,
          category: formCategory || 'General',
          title: formTitle,
          description: formDescription,
          price: formPrice || undefined,
          currency: formCurrency,
          images,
          sourceUrl: formSourceUrl || undefined,
          officialUrl: formOfficialUrl || undefined,
          status: formStatus,
          isPublished: formIsPublished,
          isFeatured: formIsFeatured,
          specifications
        });
        setFeedbackMsg('New catalogue entry published!');
      }
      handleResetForm();
      setActiveTab('catalogue');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      setFeedbackMsg('Error saving item to database.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently delete this entry from Firestore?')) {
      await deleteContentItem(id);
    }
  };

  const filteredItems = items.filter(it => {
    const matchesSearch = (it.title || '').toLowerCase().includes((searchFilter || '').toLowerCase()) ||
                          (it.category || '').toLowerCase().includes((searchFilter || '').toLowerCase());
    const matchesSection = selectedSectionFilter === 'all' || it.sectionId === selectedSectionFilter;
    return matchesSearch && matchesSection;
  });

  return (
    <div className="bg-[#0a152a] text-gray-200 border border-[#1a2a4a] rounded-2xl overflow-hidden font-mono shadow-2xl">
      {/* Top Bar */}
      <div className="px-6 py-4 bg-[#050a14] border-b border-[#1a2a4a] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-[#33ddff]" />
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
              CATALOGUE CONTENT MANAGEMENT SYSTEM
            </h3>
            <p className="text-[11px] text-gray-400">Manage all 9 sections, vehicle specs, and verified research articles</p>
          </div>
        </div>

        {feedbackMsg && (
          <div className="text-xs font-semibold text-[#33ff66] flex items-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedbackMsg}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-[#1a2a4a] bg-[#070e1c] flex items-center gap-3">
        <button
          onClick={() => setActiveTab('catalogue')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'catalogue'
              ? 'border-[#33ddff] text-[#33ddff] bg-[#0a152a]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Published Catalogue ({items.length})
        </button>

        <button
          onClick={() => {
            handleResetForm();
            setActiveTab('create');
          }}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'create'
              ? 'border-[#33ddff] text-[#33ddff] bg-[#0a152a]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Plus className="w-3.5 h-3.5 inline mr-1" />
          <span>{editingItem ? 'Edit Entry' : 'Create New Product / Article'}</span>
        </button>
      </div>

      {/* Tab 1: Catalogue List */}
      {activeTab === 'catalogue' && (
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by title or category..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#050a14] border border-[#1a2a4a] text-white rounded-xl text-xs focus:outline-hidden focus:border-[#33ddff]"
              />
            </div>

            <select
              value={selectedSectionFilter}
              onChange={(e) => setSelectedSectionFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-[#050a14] border border-[#1a2a4a] text-white rounded-xl text-xs font-mono"
            >
              <option value="all">All Nine Sections</option>
              {SECTIONS.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto border border-[#1a2a4a] rounded-xl bg-[#050a14]">
            <table className="w-full text-left text-xs divide-y divide-[#1a2a4a]">
              <thead className="bg-[#070e1c] text-gray-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Item &amp; Category</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Status &amp; Price</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2a4a]/60">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-[#0a152a]/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-900 border border-[#1a2a4a] shrink-0"
                        />
                        <div className="truncate max-w-xs">
                          <div className="font-bold text-white truncate">{item.title}</div>
                          <div className="text-[11px] text-gray-500">{item.category}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] text-gray-300 bg-[#0a152a] border border-[#1a2a4a] px-2 py-0.5 rounded">
                        {item.sectionId}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{item.price || 'Free / Spec'}</div>
                      <span className="text-[10px] uppercase text-[#33ddff]">{item.status}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePublishItem(item.id, item.isPublished)}
                          className={`p-1.5 rounded-md ${
                            item.isPublished ? 'bg-[#33ff66]/10 text-[#33ff66]' : 'bg-gray-800 text-gray-500'
                          }`}
                          title={item.isPublished ? 'Published' : 'Draft'}
                        >
                          {item.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => toggleFeaturedItem(item.id, item.isFeatured)}
                          className={`p-1.5 rounded-md ${
                            item.isFeatured ? 'bg-amber-400/20 text-amber-400' : 'bg-gray-800 text-gray-500'
                          }`}
                          title={item.isFeatured ? 'Featured' : 'Not Featured'}
                        >
                          <Star className={`w-3.5 h-3.5 ${item.isFeatured ? 'fill-amber-400' : ''}`} />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-1.5 text-[#33ddff] hover:bg-[#33ddff]/10 rounded-md"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-md"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Create / Edit Form */}
      {activeTab === 'create' && (
        <form onSubmit={handleSaveForm} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Target Section (1 of 9)</label>
              <select
                value={formSectionId}
                onChange={(e) => setFormSectionId(e.target.value as SectionId)}
                className="w-full px-3 py-2 bg-[#050a14] border border-[#1a2a4a] text-white rounded-xl text-xs"
              >
                {SECTIONS.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Category / Line</label>
              <input
                type="text"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                placeholder="e.g. Model S, Humanoid Robot, Raptor 3, Grok"
                className="w-full px-3 py-2 bg-[#050a14] border border-[#1a2a4a] text-white rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Title *</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Product or Article Title"
                className="w-full px-3 py-2 bg-[#050a14] border border-[#1a2a4a] text-white rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Price (Optional)</label>
                <input
                  type="text"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="e.g. $87,990"
                  className="w-full px-3 py-2 bg-[#050a14] border border-[#1a2a4a] text-white rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as ProductStatus)}
                  className="w-full px-3 py-2 bg-[#050a14] border border-[#1a2a4a] text-white rounded-xl text-xs"
                >
                  <option value="commercial">Commercial / Production</option>
                  <option value="prototype">Prototype / Flight Test</option>
                  <option value="announced">Announced Future Product</option>
                  <option value="published">Published Research</option>
                  <option value="draft">Internal Draft</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Detailed engineering overview, capabilities, and features..."
              className="w-full px-3 py-2 bg-[#050a14] border border-[#1a2a4a] text-white rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Technical Specifications (Key: Value per line)
            </label>
            <textarea
              rows={3}
              value={formSpecsRaw}
              onChange={(e) => setFormSpecsRaw(e.target.value)}
              placeholder={"Acceleration: 1.99 s\nRange: 359 mi\nTop Speed: 200 mph"}
              className="w-full px-3 py-2 bg-[#050a14] border border-[#1a2a4a] text-white rounded-xl text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-300 mb-1">Image URLs (comma-separated)</label>
              <input
                type="text"
                value={formImages}
                onChange={(e) => setFormImages(e.target.value)}
                placeholder="https://images.unsplash.com/..., https://..."
                className="w-full px-3 py-2 bg-[#050a14] border border-[#1a2a4a] text-white rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Official Portal URL</label>
              <input
                type="url"
                value={formOfficialUrl}
                onChange={(e) => setFormOfficialUrl(e.target.value)}
                placeholder="https://www.tesla.com/..."
                className="w-full px-3 py-2 bg-[#050a14] border border-[#1a2a4a] text-white rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formIsPublished}
                onChange={(e) => setFormIsPublished(e.target.checked)}
                className="rounded text-[#33ddff]"
              />
              <span>Publish to public catalogue</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formIsFeatured}
                onChange={(e) => setFormIsFeatured(e.target.checked)}
                className="rounded text-[#33ddff]"
              />
              <span>Highlight on Homepage Featured Showcase</span>
            </label>
          </div>

          <div className="pt-4 border-t border-[#1a2a4a] flex justify-end gap-3">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2 border border-[#1a2a4a] text-gray-400 rounded-xl text-xs hover:text-white"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#33ddff] hover:bg-[#20b8d6] text-[#050a14] rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{editingItem ? 'Update in Firestore' : 'Save & Publish'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
