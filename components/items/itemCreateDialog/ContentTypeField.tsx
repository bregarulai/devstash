import { CodeEditor } from '@/components/codeEditor/CodeEditor/CodeEditor';
import { MarkdownEditor } from '@/components/markdownEditor/MarkdownEditor/MarkdownEditor';
import { Textarea } from '@/components/ui/textarea';
import { CODE_EDITOR_TYPES, MARKDOWN_EDITOR_TYPES } from '@/lib/constants';
import { type ItemType } from '@/types/db';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { type ItemCreateValues } from '@/types/db';

interface ContentTypeFieldProps {
  selectedType: ItemType;
  contentValue: string;
  languageValue: string;
  register: UseFormRegister<ItemCreateValues>;
  setValue: UseFormSetValue<ItemCreateValues>;
}

export function ContentTypeField({
  selectedType,
  contentValue,
  languageValue,
  register,
  setValue,
}: ContentTypeFieldProps) {
  if (CODE_EDITOR_TYPES.includes(selectedType)) {
    return (
      <CodeEditor
        value={contentValue || ''}
        onChange={(v) => setValue('content', v, { shouldValidate: true })}
        language={languageValue || 'plaintext'}
      />
    );
  }

  if (MARKDOWN_EDITOR_TYPES.includes(selectedType)) {
    return (
      <MarkdownEditor
        value={contentValue || ''}
        onChange={(v) => setValue('content', v, { shouldValidate: true })}
      />
    );
  }

  return (
    <Textarea
      id='content'
      {...register('content')}
      placeholder='Content'
      rows={4}
      className='resize-none font-mono text-sm'
    />
  );
}
