import { useMemo } from "react";
import { navigation } from "../config/navigation";

export default function useNavigation(section) {

    const items = useMemo(
        () => navigation.flatMap(group => group.children),
        []
    );

    const activeNavigation = useMemo(() => {

        if (!section) {
            return items[0];
        }

        return (
            items.find(item => item.path === `/${section}`) ??
            null
        );

    }, [items, section]);

    return {

        navigation,

        activeNavigation,

        sectionExists: Boolean(activeNavigation),

    };

}