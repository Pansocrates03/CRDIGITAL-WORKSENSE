export const generateAvatar = (firstName: string, lastName: string) => {
  const name = `${firstName} ${lastName}`.trim();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
}; 