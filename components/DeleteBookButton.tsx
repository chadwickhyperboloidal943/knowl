'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteBook } from '@/lib/actions/book.actions';
import { toast } from 'sonner';
import { ConfirmationModal } from './ConfirmationModal';

export default function DeleteBookButton({ bookId }: { bookId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const onConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteBook(bookId);
            if (res.success) {
                toast.success('Book deleted successfully');
            } else {
                toast.error(res.error || 'Failed to delete book');
            }
        } catch (err) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowModal(true);
                }}
                disabled={isDeleting}
                className="absolute top-4 right-4 p-2.5 bg-white/80 dark:bg-black/40 backdrop-blur-md text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all z-10 disabled:opacity-50 shadow-sm border border-black/5 dark:border-white/10 group active:scale-90"
                aria-label="Delete book"
            >
                <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
            </button>

            <ConfirmationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={onConfirmDelete}
                title="Delete Book?"
                message="This will permanently remove this book and all its AI-generated content. This action cannot be undone."
                confirmText={isDeleting ? "Deleting..." : "Delete Permanently"}
                variant="danger"
            />
        </>
    );
}
