import React, { useMemo, useState, useEffect } from 'react';
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
  useToast,
} from '@chakra-ui/react';
import { FiTag } from 'react-icons/fi';
import * as tagApi from '../../services/tag.service';
import * as mediaItemApi from '../../services/mediaItem.service';

interface TagSelectorProps {
  mediaItemId?: string; // ID of the media item to assign/unassign tags
  allTags?: string[];
  assignedTags: string[];
  onChange: (updated: string[]) => void;
  buttonLabel?: string;
  // whether to show tiny summary inside default trigger (default false)
  showSummary?: boolean;
  trigger?: React.ReactNode;
}

const localeCompare = (a: string, b: string) => a.localeCompare(b, 'tr');

const TagSelector: React.FC<TagSelectorProps> = ({
  mediaItemId,
  allTags,
  assignedTags,
  onChange,
  buttonLabel = 'Tag Ekle',
  trigger,
}) => {
  const [tagsFromApi, setTagsFromApi] = useState<tagApi.Tag[]>([]);
  const toast = useToast();

  // Fetch tags from API on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await tagApi.getAllTags();
        setTagsFromApi(tags);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setTagsFromApi([]);
      }
    };
    fetchTags();
  }, []);

  // Source list: alphabetically sorted once (recomputed only when allTags or tagsFromApi changes)
  const sourceTags = useMemo(() => {
    const list = allTags ? allTags : tagsFromApi.map(tag => tag.name);
    return list.sort(localeCompare);
  }, [allTags, tagsFromApi]);

  // Fast lookup for assigned tags
  const assignedSet = useMemo(() => new Set(assignedTags ?? []), [assignedTags]);

  // Render the sourceTags (alphabetical). Assigned tags will be shown as "active",
  // but we DO NOT move them to the top — order remains alphabetical and stable.
  const merged = sourceTags;

  const toggle = async (tagName: string) => {
    const isAssigned = assignedSet.has(tagName);
    
    // Find the tag ID from the tag name
    const tagObject = tagsFromApi.find(t => t.name === tagName);
    if (!tagObject) {
      console.error('Tag not found:', tagName);
      return;
    }

    // If mediaItemId is provided, make API call
    if (mediaItemId) {
      try {
        if (isAssigned) {
          // Remove tag from media item
          await mediaItemApi.removeTagFromMediaItem(mediaItemId, tagObject._id);
          toast({
            title: 'Tag removed',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
        } else {
          // Add tag to media item
          await mediaItemApi.addTagsToMediaItem(mediaItemId, [tagObject._id]);
          toast({
            title: 'Tag added',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Error toggling tag:', error);
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }

    // Update local state
    let updated: string[];
    if (isAssigned) {
      updated = assignedTags.filter((t) => t !== tagName);
    } else {
      updated = [...assignedTags, tagName];
    }
    onChange(updated);
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
         </PopoverBody>
       </PopoverContent>
     </Popover>
   );
 };
 
 export default TagSelector;