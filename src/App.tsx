import { useCallback, useState } from 'react';
import { StoryViewer } from './components/StoryViewer';
import { TabBar } from './components/TabBar';
import { IVY_GROUP_INDEX } from './data/stories';
import { Access } from './screens/Access';
import { Canteen } from './screens/Canteen';
import { Community } from './screens/Community';
import { Composer } from './screens/Composer';
import { Feed } from './screens/Feed';
import { Profile } from './screens/Profile';
import { TeacherGift } from './screens/TeacherGift';
import { Thread } from './screens/Thread';
import { Tomorrow } from './screens/Tomorrow';
import { Vault } from './screens/Vault';
import { useStories } from './state/useStories';
import type { Screen } from './types';

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  /**
   * Withheld by default. Per child in production, and the real gate belongs
   * server-side — this flag only drives the UI.
   */
  const [consent, setConsent] = useState(false);

  const stories = useStories();
  const { close: closeStories } = stories;

  const navigate = useCallback(
    (next: Screen) => {
      closeStories();
      setScreen(next);
    },
    [closeStories],
  );

  const showTabs = screen !== 'onboarding' && !stories.open;

  return (
    <div className="app">
      {screen === 'onboarding' && <Access onEnter={() => navigate('feed')} />}

      {screen === 'feed' && (
        <Feed onNavigate={navigate} onOpenStory={stories.openGroup} seen={stories.seen} />
      )}

      {screen === 'tomorrow' && <Tomorrow onClose={() => navigate('feed')} />}

      {screen === 'community' && <Community onNavigate={navigate} />}

      {screen === 'chat' && <Thread onBack={() => navigate('community')} />}

      {screen === 'add' && (
        <Composer
          onCancel={() => navigate('feed')}
          onAddToDiary={() => navigate('tomorrow')}
        />
      )}

      {screen === 'canteen' && <Canteen />}

      {screen === 'profile' && <Profile onNavigate={navigate} consent={consent} />}

      {screen === 'vault' && (
        <Vault
          onBack={() => navigate('profile')}
          consent={consent}
          onToggleConsent={() => setConsent((c) => !c)}
          onOpenTile={() => stories.openGroup(IVY_GROUP_INDEX)}
        />
      )}

      {screen === 'gifts' && <TeacherGift onBack={() => navigate('community')} />}

      {showTabs && <TabBar screen={screen} onNavigate={navigate} />}

      {stories.open && (
        <StoryViewer stories={stories} onOpenPost={() => navigate('feed')} />
      )}
    </div>
  );
}
