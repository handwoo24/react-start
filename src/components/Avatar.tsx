export interface AvatarProps {
  image?: string | null;
  name: string;
}

export const Avatar = ({ image, name }: AvatarProps) => {
  return image ? (
    <div className="avatar">
      <div className="w-12 rounded-full">
        <img src={image} alt={name} />
      </div>
    </div>
  ) : (
    <div className="avatar avatar-placeholder">
      <div className="bg-neutral text-neutral-content w-12 rounded-full">
        <span className="text-xl">{name?.slice(0, 1)}</span>
      </div>
    </div>
  );
};
