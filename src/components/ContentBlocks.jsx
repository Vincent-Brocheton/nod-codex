import { useState } from "react";
import BlockRenderer from "./BlockRenderer";
import ItemModal from "./ItemModal";

const LIST_TAGS = {
    bulleted_list_item: "ul",
    numbered_list_item: "ol",
};

/**
 * Rend les blocs de contenu d'une fiche Notion, en enveloppant les listes
 * consécutives (à puces/numérotées) dans un vrai <ul>/<ol> plutôt que de
 * rendre des <li> isolés hors de toute liste (invalide, et sans puces ni
 * numérotation correctes côté navigateur).
 *
 * `manifest` permet d'ouvrir en popup les fiches liées via `[[cible]]`
 * (voir `resolveWikiLinks`) sans quitter la page en cours ; sans lui, ces
 * liens perdent juste leur interactivité (utile pour les rares appelants
 * sans accès au manifeste).
 */
export default function ContentBlocks({ content = [], manifest }) {

    const [modalRef, setModalRef] = useState(null);

    const groups = [];

    for (const block of content) {
        const listTag = LIST_TAGS[block.type] || null;
        const last = groups[groups.length - 1];

        if (listTag && last?.listTag === listTag) {
            last.blocks.push(block);
        } else {
            groups.push({ listTag, blocks: [block] });
        }
    }

    const onItemClick = manifest ? (item) => setModalRef(item) : undefined;

    return (
        <div className="contentBlocks">
            {groups.map((group, groupIndex) => {
                if (!group.listTag) {
                    const block = group.blocks[0];
                    return <BlockRenderer key={`${block.type}-${groupIndex}`} block={block} onItemClick={onItemClick} />;
                }

                const ListTag = group.listTag;

                return (
                    <ListTag key={`list-${groupIndex}`}>
                        {group.blocks.map((block, blockIndex) => (
                            <BlockRenderer key={`${block.type}-${blockIndex}`} block={block} onItemClick={onItemClick} />
                        ))}
                    </ListTag>
                );
            })}

            {modalRef ? (
                <ItemModal
                    key={`${modalRef.collectionKey}/${modalRef.slug}`}
                    manifest={manifest}
                    collectionKey={modalRef.collectionKey}
                    slug={modalRef.slug}
                    onClose={() => setModalRef(null)}
                />
            ) : null}
        </div>
    );

}
