import { CheckIcon } from '@heroicons/react/20/solid'

const tiers = [
  {
    name: 'Monthly Plan',
    id: 'tier-monthly',
    href: '/subscribe',
    priceMonthly: '499.00',
    originalPrice: 'LKR 999.00',
    description: "Get monthly access to all premium features at a special discounted price.",
    features: [
      'Unlimited chats with General English Bot',
      'Unlimited access to Idol Bot for personalized conversations',
      'Unlimited study sessions with Past Paper Bot',
      '24/7 customer support',
    ],
    featured: true,
  },
  {
    name: 'Yearly Plan',
    id: 'tier-yearly',
    href: '/subscribe',
    priceMonthly: '9999.00',
    description: "Save more with our annual subscription plan.",
    features: [
      'Two months free compared to monthly plan',
      'Unlimited chats with General English Bot',
      'Unlimited access to Idol Bot for personalized conversations',
      'Unlimited study sessions with Past Paper Bot',
      '24/7 customer support', 
    ],
    featured: true,
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function PricingCard() {
  return (
    <div className="relative isolate bg-white px-4 sm:py-32 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl">
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary to-secondary opacity-30"
        />
      </div>
      <div className="mx-auto sm:mt-0 mt-20 max-w-4xl text-center">
        <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
        <p className="mt-2 text-4xl font-bold tracking-tight text-dark_gray sm:text-5xl">
          Choose Your Perfect Plan
        </p>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Unlock unlimited learning potential with our flexible subscription plans
        </p>
      </div>
      <div className="mx-auto mt-16 flex flex-col gap-8 sm:mt-20 sm:flex-row sm:justify-center">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={classNames(
              tier.featured ? 'relative bg-dark_gray' : 'bg-white/60',
              'rounded-3xl p-8 ring-1 ring-gray-900/10 shadow-xl w-full sm:w-[384px] flex flex-col'
            )}
          >
            <h3
              id={tier.id}
              className={classNames(
                tier.featured ? 'text-primary' : 'text-primary',
                'text-base font-semibold leading-7'
              )}
            >
              {tier.name}
            </h3>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span className='text-white text-sm font-bold'>LKR</span>
              <span
                className={classNames(
                  tier.featured ? 'text-white' : 'text-gray-900',
                  'text-5xl font-bold tracking-tight'
                )}
              >
                {tier.priceMonthly}
              </span>
            </p>
            {tier.originalPrice && (
              <p className="mt-1 text-sm text-red-400 line-through">
                {tier.originalPrice}
              </p>
            )}
            <p className={classNames(
              tier.featured ? 'text-light_gray' : 'text-gray-600',
              'mt-6 text-base flex-grow'
            )}>
              {tier.description}
            </p>
            <ul
              role="list"
              className={classNames(
                tier.featured ? 'text-light_gray' : 'text-gray-600',
                'mt-8 space-y-3 text-sm leading-6'
              )}
            >
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon
                    className={classNames(
                      tier.featured ? 'text-primary' : 'text-primary',
                      'h-6 w-5 flex-none'
                    )}
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href={tier.href}
              aria-describedby={tier.id}
              className={classNames(
                'bg-primary text-white shadow-sm hover:bg-secondary hover:text-primary',
                'mt-8 block rounded-3xl px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
              )}
            >
              Get started today
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
