import cn from 'classnames';
import ReactMarkdown from 'react-markdown';
import {useEffect} from 'react';

import {Assistant as AssistantIcon, User as UserIcon} from '~/components/Icons';

import {type Role} from '~/types';

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

/**
 * Renders a message
 * TODO: Content could be json or string, need to handle both
 * TODO: Handle malformed json
 */
export default function Message({content, error, key, role = 'user'}: MessageProps) {

  // may need to optimize this
  let answer;
  let relatedLinks = [];

  try {
    const contentJson = JSON.parse(content);

    answer = contentJson.answer;
    // could potential fail as well
    relatedLinks = contentJson.relatedLinks;

  } catch {
    answer = content;
  }

  return (
    <>
      {!!relatedLinks.length && (
          <div className="links-wrapper flex gap-2 small-mobile:max-sm:text-sm item-center flex-wrap p-4">
          {relatedLinks.map((link, index) => (
            <a className="text-white bg-[#1F1F1F] rounded-4xl p-4 no-underline hover:underline" key={`link-${link.url}-${index}`}href={link.url}>{link.text}</a>
          ))}
          </div>
      )}
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
            <ReactMarkdown children={answer} />
          </div>
        </div>
      </div>
    </>
  )
}