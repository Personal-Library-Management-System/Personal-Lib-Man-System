import React, { useMemo, useState } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Wrap,
  Tag,
  TagLabel,
  IconButton,
  Icon,
  Input,
  HStack,
  Button,
  Box,
} from '@chakra-ui/react';
import { FiTag } from 'react-icons/fi';
import ALL_TAGS_FROM_DATA from '../../mock-data/all-tags.json';

export const ALL_TAGS = ALL_TAGS_FROM_DATA as string[];

interface TagSelectorProps {
  allTags?: string[];
  assignedTags: string[];
  onChange: (updated: string[]) => void;
  buttonLabel?: string;
  // whether to show tiny summary inside default trigger (default false)
  showSummary?: boolean;
  trigger?: React.ReactNode;
  // callback when a new tag is created (parent handles persistence)
  onCreateTag?: (tagName: string) => void;
}

const localeCompare = (a: string, b: string) => a.localeCompare(b, 'tr');

const TagSelector: React.FC<TagSelectorProps> = ({
  allTags,
  assignedTags,
  onChange,
  buttonLabel = 'Tag Ekle',
  trigger,
  onCreateTag,
}) => {
  const [newTag, setNewTag] = useState('');

  // Source list: alphabetically sorted once (recomputed only when allTags changes)
  const sourceTags = useMemo(() => {
    const list = allTags ? [...allTags] : [...ALL_TAGS];
    return list.sort(localeCompare);
  }, [allTags]);

  // Fast lookup for assigned tags
  const assignedSet = useMemo(() => new Set(assignedTags ?? []), [assignedTags]);

  // Render the sourceTags (alphabetical). Assigned tags will be shown as "active",
  // but we DO NOT move them to the top — order remains alphabetical and stable.
  const merged = sourceTags;

  const toggle = (tag: string) => {
    const isAssigned = assignedSet.has(tag);
    let updated: string[];
    if (isAssigned) {
      updated = assignedTags.filter((t) => t !== tag);
    } else {
      updated = [...assignedTags, tag];
    }
    onChange(updated);
  };

  const handleCreate = () => {
    const name = newTag.trim();
    if (!name) return;
    // notify parent (for now parent will console.log, later backend call)
    onCreateTag?.(name);
    // add to assigned tags locally (so newly created tag becomes selected)
    if (!assignedSet.has(name)) {
      onChange([...assignedTags, name]);
    }
    setNewTag('');
  };

  return (
    <Popover placement="bottom-start">
      <PopoverTrigger>
        {trigger ? (
          trigger
        ) : (
          <IconButton
            aria-label={buttonLabel}
            icon={<Icon as={FiTag} />}
            size="md"
            variant="outline"
            colorScheme="teal"
          />
        )}
      </PopoverTrigger>
      <PopoverContent width="320px" _focus={{ boxShadow: 'md' }}>
        <PopoverBody>
          <Wrap spacing={2}>
            {merged.map((tag) => {
               const active = assignedSet.has(tag);
               return (
                 <Tag
                   key={tag}
                   size="md"
                   variant={active ? 'solid' : 'subtle'}
                   colorScheme={active ? 'blue' : 'gray'}
                   opacity={active ? 1 : 0.45}
                   cursor="pointer"
                   onClick={() => toggle(tag)}
                   _hover={{ opacity: active ? 0.9 : 0.7 }}
                 >
                   <TagLabel>{tag}</TagLabel>
                 </Tag>
               );
             })}
           </Wrap>

           {/* + add tag area */}
           <Box mt={3} px={1}>
             <HStack spacing={2}>
               <Input
                 value={newTag}
                 onChange={(e) => setNewTag(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                     e.preventDefault();
                     handleCreate();
                   }
                 }}
                 placeholder="+ add tag"
                 size="sm"
               />
               <Button size="sm" onClick={handleCreate}>
                 + Add
               </Button>
             </HStack>
           </Box>
         </PopoverBody>
       </PopoverContent>
     </Popover>
   );
 };
 
 export default TagSelector;