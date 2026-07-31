import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Best AC Service in Dwarka Mor Delhi | AC Repair & Installation",

    description:
        "Book AC repair, AC installation, AC gas refill and AC cleaning service in Dwarka Mor Delhi.",

    keywords: [
        "AC service Dwarka Mor",
        "AC repair Dwarka Mor",
        "AC gas refill Dwarka Mor",
        "AC installation Dwarka Mor"
    ],
};
export default function DwarkaMorACService() {
    return (
        <main className="min-h-screen p-8">

            <h1 className="text-3xl font-bold">
                Best AC Service in Dwarka Mor Delhi
            </h1>

            <p className="mt-4">
                AC In Delhi provides trusted doorstep AC repair,
                AC installation, AC gas refill and AC cleaning
                services in Dwarka Mor Delhi.
            </p>

            <h2 className="text-2xl font-bold mt-8">
                Our AC Services in Dwarka Mor
            </h2>

            <ul className="mt-4 list-disc ml-6">
                <li>AC Repair Service</li>
                <li>AC Installation</li>
                <li>AC Gas Refill</li>
                <li>AC Cleaning</li>
                <li>AC Maintenance</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8">
                Areas We Serve
            </h2>

            <p>
                Dwarka Mor, Uttam Nagar, Nawada, Janakpuri,
                Dwarka and nearby areas of Delhi.
            </p>

            <button className="mt-8 bg-blue-600 text-white px-6 py-3 rounded">
                Book AC Service
            </button>

        </main>
    );
}