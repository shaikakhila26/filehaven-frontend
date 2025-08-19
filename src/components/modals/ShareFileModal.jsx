import { useEffect, useState } from "react";

const SHARE_API = "http://localhost:8080/api"; // adjust as needed

const permissionOptions = [
  { value: "view", label: "Viewer" },
  { value: "edit", label: "Editor" },
];

export default function ShareFileModal({ file, onClose }) {
  const [email, setEmail] = useState("");
  const [perm, setPerm] = useState("view");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [publicPerm, setPublicPerm] = useState("view");
  const [people, setPeople] = useState([]); // [{email, permissionType}]
  const [links, setLinks] = useState([]); // [{url, type, ...}]

  // ------------- LOAD EXISTING SHARES/PERMISSIONS ---------------------
  useEffect(() => {
    setError("");
    // Load current permissions (users this file is shared with)
    fetch(`${SHARE_API}/files/${file.id}/permissions-list`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json()).then(data => {
        if (data.success) setPeople(data.permissions || []);
        else setError(data.error || "Error loading permissions");
      });

    // Load share links
    fetch(`${SHARE_API}/files/${file.id}/share-links`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json()).then(data => {
        if (data.success) setLinks(data.links || []);
        else setError(data.error || "Error loading links");
      });
  }, [file.id]);

  // ------------- CREATE/REVOKE SHARE LINK ------------------------
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
      setShareLink(data.url);
      // You may want to refresh the links list here.
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
      setShareLink("");
    } else setError(data.error || "Failed to revoke link");
  }

  // ------------- DIRECT EMAIL SHARE ------------------------
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

  // ------------- RENDER UI ------------------------
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[440px] max-w-full shadow-lg">
        <h2 className="text-xl font-bold mb-3">Share "{file.name}"</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}

        {/* Public Link Section */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Get shareable link</label>
          <select
            value={publicPerm}
            onChange={e => setPublicPerm(e.target.value)}
            className="border p-1 rounded mr-2"
          >
            {permissionOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={handleCreateShareLink}
            className="bg-blue-600 text-white px-2 py-1 rounded"
            disabled={loading}
          >Create Link</button>
          {shareLink && (
            <div className="mt-2 bg-gray-100 text-xs rounded px-2 py-1 flex items-center gap-2">
              <a
        href={shareLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline truncate max-w-xs"
        title={shareLink}
      >
        {shareLink}
      </a>
      <button
        onClick={() => {
          navigator.clipboard.writeText(shareLink)
            .then(() => alert("Link copied to clipboard"))
            .catch(() => alert("Failed to copy link"));
        }}
        className="px-1 text-sm bg-gray-200 rounded"
      >
        Copy
      </button>
              <button
                className="ml-2 text-red-600"
                onClick={() => handleRevokeLink({ token: shareLink.split("/s/")[1] })}
                disabled={loading}
              >Revoke</button>
            </div>
          )}
        </div>

        {/* Show existing links */}
        {links.length > 0 && (
          <div className="mb-3">
            <div className="font-bold mb-1">Existing Share Links</div>
            {links.map(link => (
              <div key={link.token || link.url} className="flex items-center mb-1 text-xs gap-2">
                <span>{link.url}</span>
                <span className="bg-gray-200 px-1 rounded">{link.permission_type}</span>
                <button className="text-red-600" onClick={() => handleRevokeLink(link)} disabled={loading}>Revoke</button>
              </div>
            ))}
          </div>
        )}

        {/* Direct Email Share Section */}
        <div className="mb-3">
          <div className="font-medium mb-1">Share with a person:</div>
          <input
            className="border p-1 rounded mr-2 w-[50%]"
            placeholder="user@example.com"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <select
            value={perm}
            onChange={e => setPerm(e.target.value)}
            className="border p-1 rounded mr-2"
          >
            {permissionOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={handleShareWithEmail}
            className="bg-blue-600 text-white px-2 py-1 rounded"
            disabled={loading}
          >Share</button>
        </div>

        {/* Existing users with permissions */}
        <div className="mb-2">
          <div className="font-medium mb-1">People with access:</div>
          {people.length === 0 && <div className="text-gray-500 text-xs">No one else has access.</div>}
          {people.map(person => (
            <div key={person.email || person.sharedWith} className="flex items-center text-xs gap-2 mb-1">
              <span>{person.email || person.sharedWith}</span>
              <span className="bg-gray-200 px-1 rounded">{person.permissionType || person.permission_type}</span>
              <button className="text-red-600" onClick={() => handleRemovePerson(person)} disabled={loading}>Remove</button>
            </div>
          ))}
        </div>
        <button className="mt-3 bg-gray-300 px-3 py-1 rounded" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
