import { AlertTriangle } from "lucide-react";

type Props = {
	open: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
	isPending?: boolean;
};

export function ConfirmDialog({
	open,
	title,
	message,
	confirmLabel = "削除",
	cancelLabel = "キャンセル",
	onConfirm,
	onCancel,
	isPending = false,
}: Props) {
	if (!open) return null;

	return (
		<div
			role="dialog"
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={(e) => {
				if (e.target === e.currentTarget) onCancel();
			}}
			onKeyDown={() => {}}
		>
			<div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
				<div className="flex items-start gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
						<AlertTriangle className="h-5 w-5 text-red-600" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
						<p className="mt-1 text-sm text-gray-600">{message}</p>
					</div>
				</div>
				<div className="mt-6 flex justify-end gap-3">
					<button
						type="button"
						onClick={onCancel}
						disabled={isPending}
						className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
					>
						{cancelLabel}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isPending}
						className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isPending ? "処理中..." : confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
