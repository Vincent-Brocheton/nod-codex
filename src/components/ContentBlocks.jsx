import BlockRenderer from "./BlockRenderer";

const LIST_TAGS = {
    bulleted_list_item: "ul",
    numbered_list_item: "ol",
};

/**
 * Rend les blocs de contenu d'une fiche Notion, en enveloppant les listes
 * consécutives (à puces/numérotées) dans un vrai <ul>/<ol> plutôt que de
 * rendre des <li> isolés hors de toute liste (invalide, et sans puces ni
 * numérotation correctes côté navigateur).
 */
export default function ContentBlocks({ content = [] }) {

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

    return (
        <div className="contentBlocks">
            {groups.map((group, groupIndex) => {
                if (!group.listTag) {
                    const block = group.blocks[0];
                    return <BlockRenderer key={`${block.type}-${groupIndex}`} block={block} />;
                }

                const ListTag = group.listTag;

                return (
                    <ListTag key={`list-${groupIndex}`}>
                        {group.blocks.map((block, blockIndex) => (
                            <BlockRenderer key={`${block.type}-${blockIndex}`} block={block} />
                        ))}
                    </ListTag>
                );
            })}
        </div>
    );

}
