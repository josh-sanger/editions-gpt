import cn from 'classnames';
import ReactMarkdown from 'react-markdown';

import {Assistant as AssistantIcon, User as UserIcon} from '~/components/Icons';

import {Role} from '~/types';

export interface MessageProps {
  content: string;
  key?: string;
  role?: Role;
  error?: boolean;
}

export interface RoleIconProps {
  error?: boolean;
  role: Role;
}

/**
 * Returns the role icon based on the role (user, assistant, system)
 * @param role The role of the message
 * @param error Set to true if the message is an error
 *
 * @returns The role icon
 */
const RoleIcon = ({role, error}: RoleIconProps) => {
  switch (role) {
    case 'system':
    case 'assistant':
      return <AssistantIcon error={error} />;
    case 'user':
      return <UserIcon />;
    default:
      return <AssistantIcon />;;
  };
};

const getRoleClasses = (role: Role) => {
  switch (role) {
    case 'system':
    case 'assistant':
      return 'bg-white';
    case 'user':
      return 'bg-light-shade';
    default:
      return '';
  }
};

/**
 * Renders a message
 */
export default function Message({content, error, key, role = 'user'}: MessageProps) {
  return (
    <div
      className={cn(
        'message w-full p-4 flex small-mobile:max-sm:text-sm',
        role === 'user' ? 'justify-end text-right' : 'justify-start',
        error && 'text-error'
      )}
      key={key || ''}
    >
      <div className={cn(
        'message-inner space-x-4 max-w-[480px] rounded-4xl p-4',
        role === 'user' ? 'bg-gradient-to-r from-dark-blue to-light-blue' : 'bg-white text-black',
      )}>
        <div className="response">
          <ReactMarkdown children={content} />
        </div>
      </div>
    </div>
  )
}