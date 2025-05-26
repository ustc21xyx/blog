const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getAvatarUrl = (avatar: string | undefined): string | undefined => {
  if (!avatar) return undefined;
  
  // If it's already a full URL (external URLs like GitHub, etc.), return as is
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  
  // If it's a relative path starting with /uploads/, prepend the server base URL
  if (avatar.startsWith('/uploads/')) {
    const serverBaseUrl = API_BASE_URL.replace('/api', '');
    return `${serverBaseUrl}${avatar}`;
  }
  
  // For any other relative paths, treat as server relative
  if (avatar.startsWith('/')) {
    const serverBaseUrl = API_BASE_URL.replace('/api', '');
    return `${serverBaseUrl}${avatar}`;
  }
  
  // If it's just a filename or other format, treat as external URL
  return avatar;
};