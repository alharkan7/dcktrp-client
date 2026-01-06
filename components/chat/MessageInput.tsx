'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';

interface MessageInputProps {
    onSend: (message: string, files?: File[]) => void;
    disabled?: boolean;
    onAttachmentsChange?: (hasFiles: boolean) => void;
}

export default function MessageInput({ onSend, disabled = false, onAttachmentsChange }: MessageInputProps) {
    const [input, setInput] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Notify parent when attachments change
    useEffect(() => {
        if (onAttachmentsChange) {
            onAttachmentsChange(attachedFiles.length > 0);
        }
    }, [attachedFiles.length, onAttachmentsChange]);

    const handleSend = () => {
        if ((input.trim() || attachedFiles.length > 0) && !disabled) {
            onSend(input.trim(), attachedFiles.length > 0 ? attachedFiles : undefined);
            setInput('');
            setAttachedFiles([]);
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachedFiles((prev) => [...prev, ...files]);
        // Reset input value to allow re-selecting the same file
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveFile = (index: number) => {
        setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) {
            return <ImageIcon className="h-4 w-4" />;
        }
        return <FileText className="h-4 w-4" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <div className="border-t bg-white dark:bg-slate-950 p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
                {/* File attachments preview */}
                {attachedFiles.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {attachedFiles.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm"
                            >
                                {getFileIcon(file)}
                                <span className="max-w-[200px] truncate">
                                    {file.name}
                                </span>
                                <span className="text-slate-500 text-xs">
                                    ({formatFileSize(file.size)})
                                </span>
                                <button
                                    onClick={() => handleRemoveFile(index)}
                                    className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
                                    disabled={disabled}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input area */}
                <div className="flex gap-2">
                    {/* File attachment button */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.txt,.doc,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled}
                        className="flex-shrink-0"
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>

                    {/* Message input */}
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={disabled}
                        className="flex-1"
                    />

                    {/* Send button */}
                    <Button
                        onClick={handleSend}
                        disabled={disabled || (!input.trim() && attachedFiles.length === 0)}
                        className="flex-shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
