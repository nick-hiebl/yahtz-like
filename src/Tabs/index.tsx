import { useState } from 'react';

import './Tabs.css';

export type Tab = {
    id: string;
    content: React.ReactNode;
    name: string;
};

type TabsProps = {
    tabs: Tab[];
    initialTab?: string;
};

export const Tabs = ({ initialTab, tabs }: TabsProps) => {
    const [currentTab, setTab] = useState(initialTab ?? tabs[0]?.id);

    return (
        <div className="column">
            <div className="row" role="tablist">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        aria-selected={currentTab === tab.id}
                        onClick={() => setTab(tab.id)}
                        role="tab"
                    >
                        {tab.name}
                    </button>
                ))}
            </div>
            {tabs.map(tab => (
                <div key={tab.id} hidden={currentTab !== tab.id} role="tabpanel">
                    {tab.content}
                </div>
            ))}
        </div>
    );
};
