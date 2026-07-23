import { FileText } from "lucide-react";

export default function ItemListButton({ label, selected, onClick, badges, icon }) {
    return (
        <button
            className={selected ? "selected" : ""}
            onClick={onClick}
        >
            {icon || <FileText aria-hidden="true" size={17} />}
            <span>{label}</span>
            {badges}
        </button>
    );
}
