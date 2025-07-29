const Commitment = () => (
    <section className="py-20">
        <div className="container mx-auto px-4 text-center">
            <h2 className="mb-12 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                A Partner on Your Educational Journey.
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <CommitmentCard title="To Our Learners" description="We promise to provide a world-class learning environment where you can explore your curiosity and achieve your goals." />
                <CommitmentCard title="To Our Instructors" description="We promise to be a true partner, providing you with the tools and support you need to make a lasting impact." />
                <CommitmentCard title="To the Future of Education" description="We promise to continue pushing the boundaries of what's possible and to innovate with purpose." />
            </div>
        </div>
    </section>
);

const CommitmentCard = ({ title, description }) => (
    <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <h3 className="mb-4 text-2xl font-bold text-green-500">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
);

export default Commitment;