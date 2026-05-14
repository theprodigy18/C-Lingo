import { oauthLogos } from '../../lib/oauth';
import { oauthLogin } from '../../lib/api/auth';

export const OAuthButtons = () => {
  return (
    <>
      <div className="w-full flex items-center justify-center space-x-2 text-gray-400 text-xs py-2">
        <span>Or Register with</span>
      </div>

      <div className="flex space-x-6">
        <button
          onClick={() => oauthLogin('google')}
          className="w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-md border border-gray-50 hover:shadow-lg transition-shadow cursor-pointer"
          aria-label="Sign in with Google"
        >
          <div
            className="w-8 h-8"
            dangerouslySetInnerHTML={{ __html: oauthLogos.google.svg }}
          />
        </button>

        <button
          onClick={() => oauthLogin('github')}
          className="w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-md border border-gray-50 hover:shadow-lg transition-shadow cursor-pointer"
          aria-label="Sign in with GitHub"
        >
          <div
            className="w-8 h-8"
            dangerouslySetInnerHTML={{ __html: oauthLogos.github.svg }}
          />
        </button>
      </div>
    </>
  );
};
