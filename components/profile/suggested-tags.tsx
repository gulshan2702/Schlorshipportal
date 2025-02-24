interface SuggestedTagsProps {
  tags: string[]
  onSelect: (tag: string) => void
}

export function SuggestedTags({ tags, onSelect }: SuggestedTagsProps) {
  return (
    <div className="mt-2">
      <div className="text-sm font-medium text-gray-700 mb-1">Suggested:</div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onSelect(tag)}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
} 