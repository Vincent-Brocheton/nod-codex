import { FileText } from "lucide-react";

export default function ItemListButton({ label, selected, onClick }) {
    return (
        <button
            className={selected ? "selected" : ""}
            onClick={onClick}
        >
            <FileText aria-hidden="true" size={17} />
            <span>{label}</span>
        </button>
    );
}
