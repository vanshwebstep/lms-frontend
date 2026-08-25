import { useState, useRef } from "react";
import {
  Camera,
  Save,
  User,
  Mail,
  Phone,
  Globe,
  Briefcase,
  MapPin,
  Star,
  BookOpen,
  Users,
  Award,
  Edit2,
  Check,
  X,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

const CoachProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "Arjun Mehta",
    email: "arjun@example.com",
    phone: "+91 98765 43210",
    bio: "Experienced full-stack developer and educator with 8+ years in web technologies. I specialize in React, Node.js and modern JavaScript.",
    expertise: ["React.js", "Node.js", "JavaScript", "UI/UX Design"],
    location: "Mumbai, India",
    website: "https://arjunmehta.dev",
    experience: "8 Years",
    category: "Web Development",
    language: "English, Hindi",
    social: {
      twitter: "https://twitter.com/arjunmehta",
      linkedin: "https://linkedin.com/in/arjunmehta",
      instagram: "",
      youtube: "https://youtube.com/@arjunmehta",
    },
    avatar: null,
  });

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [newTag, setNewTag] = useState("");

  const stats = [
    { icon: BookOpen, label: "Courses", value: "12" },
    { icon: Users, label: "Students", value: "1,248" },
    { icon: Star, label: "Avg Rating", value: "4.8" },
    { icon: Award, label: "Certificates", value: "3" },
  ];

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const removeTag = (tag) => {
    setProfile((p) => ({ ...p, expertise: p.expertise.filter((t) => t !== tag) }));
  };

  const addTag = (e) => {
    if (e.key === "Enter" && newTag.trim()) {
      setProfile((p) => ({ ...p, expertise: [...p.expertise, newTag.trim()] }));
      setNewTag("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#13131f]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Coach Profile</h1>
            <p className="text-sm text-gray-400">Manage your public profile and settings</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              saved ? "bg-green-600 text-white" : "bg-violet-600 hover:bg-violet-700 text-white"
            } disabled:opacity-60`}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : saved ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Profile Banner */}
        <div className="relative bg-gradient-to-r from-violet-900/40 to-indigo-900/40 border border-violet-500/20 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-4xl font-black text-white">
                {profile.name.charAt(0)}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-violet-600 hover:bg-violet-700 rounded-lg flex items-center justify-center transition-colors"
              >
                <Camera size={14} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-violet-400 text-sm">{profile.category}</p>
              <p className="text-gray-400 text-sm mt-1 max-w-md">{profile.bio.substring(0, 100)}...</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center bg-white/5 rounded-xl px-4 py-3">
                  <div className="text-lg font-bold">{value}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 justify-center mt-0.5"><Icon size={11} />{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
          {["profile", "social", "security"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab: Profile */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><User size={16} className="text-violet-400" /> Basic Info</h3>
                {[
                  { label: "Full Name", key: "name", icon: User, type: "text" },
                  { label: "Email Address", key: "email", icon: Mail, type: "email" },
                  { label: "Phone Number", key: "phone", icon: Phone, type: "tel" },
                  { label: "Location", key: "location", icon: MapPin, type: "text" },
                  { label: "Website", key: "website", icon: Globe, type: "url" },
                  { label: "Experience", key: "experience", icon: Briefcase, type: "text" },
                ].map(({ label, key, icon: Icon, type }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5"><Icon size={12} />{label}</label>
                    <input
                      type={type}
                      value={profile[key]}
                      onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Bio */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><Edit2 size={16} className="text-violet-400" /> Bio</h3>
                <textarea
                  rows={5}
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 resize-none placeholder-gray-600"
                  placeholder="Write a short bio about yourself..."
                />
                <p className="text-xs text-gray-600 mt-1 text-right">{profile.bio.length}/500</p>
              </div>

              {/* Expertise Tags */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><Award size={16} className="text-violet-400" /> Expertise / Skills</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.expertise.map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 bg-violet-500/20 text-violet-300 text-xs px-3 py-1.5 rounded-full">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors"><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="Add skill and press Enter..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-600"
                />
              </div>

              {/* Category & Language */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Briefcase size={16} className="text-violet-400" /> Teaching Info</h3>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Category</label>
                  <select
                    value={profile.category}
                    onChange={(e) => setProfile((p) => ({ ...p, category: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                  >
                    {["Web Development", "Mobile Development", "Data Science", "Design", "Marketing", "Business"].map((c) => (
                      <option key={c} value={c} className="bg-[#1a1a2e]">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Languages</label>
                  <input
                    type="text"
                    value={profile.language}
                    onChange={(e) => setProfile((p) => ({ ...p, language: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                    placeholder="e.g. English, Hindi"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Social */}
        {activeTab === "social" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-2xl space-y-5">
            <h3 className="font-semibold text-lg">Social Media Links</h3>
            {[
              { key: "twitter", icon: Globe, label: "Twitter", color: "text-sky-400", placeholder: "https://twitter.com/username" },
              { key: "linkedin", icon: Globe , label: "LinkedIn", color: "text-blue-500", placeholder: "https://linkedin.com/in/username" },
              { key: "instagram", icon: Globe , label: "Instagram", color: "text-pink-400", placeholder: "https://instagram.com/username" },
              { key: "youtube", icon: Globe, label: "YouTube", color: "text-red-500", placeholder: "https://youtube.com/@username" },
            ].map(({ key, icon: Icon, label, color, placeholder }) => (
              <div key={key}>
                <label className={`text-xs mb-1.5 flex items-center gap-1.5 ${color}`}><Icon size={13} />{label}</label>
                <input
                  type="url"
                  value={profile.social[key]}
                  onChange={(e) => setProfile((p) => ({ ...p, social: { ...p.social, [key]: e.target.value } }))}
                  placeholder={placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-600"
                />
              </div>
            ))}
          </div>
        )}

        {/* Tab: Security */}
        {activeTab === "security" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-md space-y-5">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Lock size={18} className="text-violet-400" /> Change Password</h3>
            {[
              { key: "current", label: "Current Password" },
              { key: "new", label: "New Password" },
              { key: "confirm", label: "Confirm New Password" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 mb-1.5 block">{label}</label>
                <div className="relative">
                  <input
                    type={showPassword[key] ? "text" : "password"}
                    value={passwords[key]}
                    onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-600"
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => ({ ...s, [key]: !s[key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showPassword[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
            <button className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl py-2.5 text-sm font-medium transition-colors">
              Update Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachProfile;