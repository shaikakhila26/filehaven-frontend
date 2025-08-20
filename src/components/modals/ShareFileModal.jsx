import { useEffect, useState } from "react";

const SHARE_API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const permissionOptions = [
  { value: "view", label: "Viewer" },
  { value: "edit", label: "Editor" },
];

export default function ShareFileModal({ file, onClose }) {
  const [email, setEmail] = useState("");
  const [perm, setPerm] = useState("view");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [publicPerm, setPublicPerm] = useState("view");
  const [people, setPeople] = useState([]);
  const [links, setLinks] = useState([]);

  // ---------- Load existing shares ----------
  async function loadPermissions() {
    try {
      setError("");
      const res = await fetch(`${SHARE_API}/files/${file.id}/permissions-list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) setPeople(data.permissions || []);
      else setError(data.error || "Error loading permissions");
    } catch {
      setError("Failed to load permissions");
    }
  }

  async function loadLinks() {
    try {
      setError("");
      const res = await fetch(`${SHARE_API}/files/${file.id}/share-links`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) setLinks(data.links || []);
      else setError(data.error || "Error loading links");
    } catch {
      setError("Failed to load links");
    }
  }

  useEffect(() => {
    loadPermissions();
    loadLinks();
  }, [file.id]);

  // ---------- Create / Revoke link ----------
  async function handleCreateShareLink() {
    setLoading(true); setError("");
    const res = await fetch(`${SHARE_API}/files/${file.id}/share-link`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ permissionType: publicPerm })
    });
    const data = await res.json();
    setLoading(false);
    if (data.url) {
      await loadLinks();
    } else setError(data.error || "Failed to create link");
  }

  async function handleRevokeLink(link) {
    setLoading(true); setError("");
    const url = `${SHARE_API}/files/${file.id}/share-link/${link.token}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setLinks(links.filter(l => l.token !== link.token));
    } else setError(data.error || "Failed to revoke link");
  }

  // ---------- Direct Email Share ----------
  async function handleShareWithEmail() {
    if (!email) { setError("Specify a user email."); return; }
    setLoading(true); setError("");
    const res = await fetch(`${SHARE_API}/files/${file.id}/permissions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sharedWith: email, permissionType: perm })
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setPeople([...people.filter(p => p.email !== email), { email, permissionType: perm }]);
      setEmail("");
    } else setError(data.error || "Failed to share");
  }

  async function handleRemovePerson(person) {
    setLoading(true); setError("");
    const url = `${SHARE_API}/files/${file.id}/permissions/${encodeURIComponent(person.id)}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setPeople(people.filter(p => p.email !== person.email));
    } else setError(data.error || "Failed to remove user");
  }

  // ---------- UI ----------
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[460px] max-w-full shadow-lg">
        <h2 className="text-xl font-bold mb-3">Share "{file.name}"</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}

        {/* Public Link */}
        <div className="mb-5">
          <label className="block mb-2 font-medium">Get shareable link</label>
          <div className="flex gap-2 items-center mb-2">
            <select
              value={publicPerm}
              onChange={e => setPublicPerm(e.target.value)}
              className="border p-1 rounded flex-1"
            >
              {permissionOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleCreateShareLink}
              className="bg-blue-600 text-white px-3 py-1 rounded"
              disabled={loading}
            >Create</button>
          </div>

          {links.length > 0 && (
            <div className="space-y-2 max-h-28 overflow-y-auto">
              {links.map(link => (
                <div key={link.token} className="flex items-center justify-between text-xs bg-gray-100 rounded p-2">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline truncate max-w-[250px]"
                    title={link.url}
                  >
                    {link.url}
                  </a>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-200 px-1 rounded">{link.permission_type}</span>
                    <button
                      className="text-red-600 text-xs"
                      onClick={() => handleRevokeLink(link)}
                      disabled={loading}
                    >Revoke</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Share with specific people */}
        <div className="mb-5">
          <div className="font-medium mb-2">Share with a person:</div>
          <div className="flex gap-2 mb-2">
            <input
              className="border p-1 rounded flex-1"
              placeholder="user@example.com"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <select
              value={perm}
              onChange={e => setPerm(e.target.value)}
              className="border p-1 rounded"
            >
              {permissionOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleShareWithEmail}
              className="bg-blue-600 text-white px-3 py-1 rounded"
              disabled={loading}
            >Share</button>
          </div>
        </div>

        {/* People with access */}
        <div>
          <div className="font-medium mb-2">People with access:</div>
          {people.length === 0 && <div className="text-gray-500 text-xs">No one else has access.</div>}
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {people.map(person => (
              <div key={person.email || person.sharedWith} className="flex items-center justify-between text-xs bg-gray-100 rounded p-2">
                <span>{person.email || person.sharedWith}</span>
                <div className="flex items-center gap-2">
                  <span className="bg-gray-200 px-1 rounded">{person.permissionType || person.permission_type}</span>
                  <button
                    className="text-red-600 text-xs"
                    onClick={() => handleRemovePerson(person)}
                    disabled={loading}
                  >Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button className="bg-gray-300 px-4 py-1 rounded" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
