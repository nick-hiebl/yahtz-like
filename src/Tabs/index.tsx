

type Tab = {
    id: string;
    content: React.ReactNode;
    name: string;
};

type TabsProps = {
    tabs: Tab[];
    selectedTabId: string;
};

export const Tabs = ({ tabs }: TabsProps) => {
    return (
        <div className="column">
            <div className="row"></div>
        </div>
    );
};
