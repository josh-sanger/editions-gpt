import cn from 'classnames';
import ReactMarkdown from 'react-markdown';

import editionsData from '~/data/editions.json';
import {Link as LinkIcon} from '~/components/Icons';

import {type Role} from '~/types';

export interface MessageProps {
  content: string;
  role?: Role;
  error?: boolean;
}

export interface RoleIconProps {
  error?: boolean;
  role: Role;
}

const getProductInfo = (productId: number) => {

  // get the product info from the product id using editionsData
  const productInfo = editionsData.sections.find((section) => section.productId === productId);

  return productInfo;
}

/**
 * Renders a message
 * TODO: Content could be json or string, need to handle both
 * TODO: Handle malformed json
 */
export default function Message({content, error, role = 'user'}: MessageProps) {

  // may need to optimize this
  let answer;
  let productIds = [];

  try {
    const contentJson = JSON.parse(content);

    answer = contentJson.answer;
    // could potential fail as well
    productIds = contentJson.productIds || [];
  } catch {
    answer = content;
  }

  return (
    <>
      {!!productIds.length && (
        <div className="productIds grid md:grid-cols-2 gap-2 items-end">
          {productIds.map((id: number, index: number) => {
            const productInfo = getProductInfo(id) as any;
            return (
              <>
                <div
                  key={`${productInfo.title}-${index}`}
                  className="text-white bg-[#1F1F1F] rounded-4xl p-4 grid grid-rows-[1fr_auto]"
                >
                  <div className="">
                    {productInfo?.youtubeId && (
                      <iframe
                        className="w-full aspect-video rounded-t-[20px] mb-4"
                        src={`https://www.youtube.com/embed/${productInfo.youtubeId}`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    )}
                    <h2 className="text-lg font-bold mb-2">{productInfo.title}</h2>
                    <p className="text-[#868686] text-sm">{productInfo.content}</p>
                  </div>
                  {!!productInfo?.relatedLinks.length && (
                    <div className="links-wrapper flex gap-2 small-mobile:max-sm:text-sm item-center flex-wrap mt-4">
                      {productInfo.relatedLinks.map((link: any, index: number) => (
                        <a
                          className="text-white no-underline hover:underline text-sm inline-flex gap-1"
                          key={`link-${link.url}-${index}`} href={link.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <LinkIcon />
                          {link.content}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </>
            );
          })}
        </div>
      )}
      <div
        className={cn(
          'message w-full p-4 flex small-mobile:max-sm:text-sm',
          role === 'user' ? 'justify-end text-right' : 'justify-start',
          error && 'text-error'
        )}
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