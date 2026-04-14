import type { Book } from "@hr-management/shared";
import { LayoutGrid, List, Plus } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BookCardGrid } from "@/features/books/components/BookCardGrid";
import { BookFormModal } from "@/features/books/components/BookFormModal";
import { BookTable } from "@/features/books/components/BookTable";
import { useBooks, useDeleteBook } from "@/features/books/hooks/useBooks";

const LIMIT = 12;

type ViewMode = "card" | "table";

export function BookListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const page = Number(searchParams.get("page") || "1");
	const { data, isLoading } = useBooks(page, LIMIT);
	const deleteMutation = useDeleteBook();

	const [viewMode, setViewMode] = useState<ViewMode>("card");
	const [modalOpen, setModalOpen] = useState(false);
	const [editingBook, setEditingBook] = useState<Book | undefined>();
	const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

	const openCreate = () => {
		setEditingBook(undefined);
		setModalOpen(true);
	};

	const openEdit = (book: Book) => {
		setEditingBook(book);
		setModalOpen(true);
	};

	const handleDeleteRequest = (id: string) => {
		setDeleteTargetId(id);
	};

	const handleDeleteConfirm = () => {
		if (!deleteTargetId) return;
		deleteMutation.mutate(deleteTargetId, {
			onSuccess: () => {
				toast.success("書籍を削除しました");
				setDeleteTargetId(null);
			},
			onError: () => toast.error("削除に失敗しました。再度お試しください"),
		});
	};

	const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900">書籍一覧</h1>
				<div className="flex items-center gap-2">
					<div className="flex rounded-md border border-gray-300">
						<button
							type="button"
							onClick={() => setViewMode("card")}
							className={`rounded-l-md px-2.5 py-1.5 ${viewMode === "card" ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"}`}
							title="カード表示"
						>
							<LayoutGrid className="h-4 w-4" />
						</button>
						<button
							type="button"
							onClick={() => setViewMode("table")}
							className={`rounded-r-md border-l border-gray-300 px-2.5 py-1.5 ${viewMode === "table" ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"}`}
							title="テーブル表示"
						>
							<List className="h-4 w-4" />
						</button>
					</div>
					<button
						type="button"
						onClick={openCreate}
						className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
					>
						<Plus className="h-4 w-4" />
						書籍を登録
					</button>
				</div>
			</div>

			{isLoading ? (
				<div className="py-12 text-center text-gray-500">読み込み中...</div>
			) : data ? (
				<>
					{viewMode === "card" ? (
						<BookCardGrid
							books={data.books}
							onEdit={openEdit}
							onDelete={handleDeleteRequest}
						/>
					) : (
						<div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
							<BookTable
								books={data.books}
								onEdit={openEdit}
								onDelete={handleDeleteRequest}
							/>
						</div>
					)}

					{totalPages > 1 && (
						<div className="mt-4 flex items-center justify-between">
							<p className="text-sm text-gray-600">
								全{data.total}件中 {(page - 1) * LIMIT + 1}〜
								{Math.min(page * LIMIT, data.total)}件
							</p>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => setSearchParams({ page: String(page - 1) })}
									disabled={page <= 1}
									className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
								>
									前へ
								</button>
								<button
									type="button"
									onClick={() => setSearchParams({ page: String(page + 1) })}
									disabled={page >= totalPages}
									className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
								>
									次へ
								</button>
							</div>
						</div>
					)}
				</>
			) : null}

			<BookFormModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				book={editingBook}
			/>

			<ConfirmDialog
				open={!!deleteTargetId}
				title="書籍の削除"
				message="この書籍を削除しますか？この操作は取り消せません。"
				onConfirm={handleDeleteConfirm}
				onCancel={() => setDeleteTargetId(null)}
				isPending={deleteMutation.isPending}
			/>
		</div>
	);
}
