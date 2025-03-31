import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext"; // Assuming you have this context

const Deals = () => {
    // Get user context
    const { user } = useContext(AuthContext);
    const isBuyer = user?.role === 'buyer';
    const isSeller = user?.role === 'seller';

    // State for deals list
    const [deals, setDeals] = useState([]);
    const [availableDeals, setAvailableDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for form
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
    });
    const [formVisible, setFormVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);

    // Load deals when component mounts
    useEffect(() => {
        fetchDeals();

        // If user is a seller, also fetch available deals (deals without a seller)
        if (isSeller) {
            fetchAvailableDeals();
        }
    }, [isSeller]);

    // Fetch user's deals from API
    const fetchDeals = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/deals");
            setDeals(response.data);
            setError(null);
        } catch (err) {
            setError("Failed to load deals: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    // Fetch available deals (for sellers only)
    const fetchAvailableDeals = async () => {
        try {
            const response = await axios.get("/api/deals/available");
            setAvailableDeals(response.data);
        } catch (err) {
            console.error("Failed to load available deals:", err);
        }
    };

    // Handle form input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle form submission for buyers creating a deal
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setSubmitting(true);

        try {
            // No seller is specified at creation time
            const response = await axios.post("/api/deals/create", formData);

            // Add new deal to the list
            setDeals([response.data, ...deals]);

            // Reset form
            setFormData({
                title: "",
                description: "",
                price: "",
            });
            setFormVisible(false);

        } catch (err) {
            setFormError("Failed to create deal: " + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    // Handle a seller accepting a deal
    const handleAcceptDeal = async (dealId) => {
        try {
            await axios.put("/api/deals/status", { dealId, status: 'Accepted' });

            // Update local state
            if (availableDeals.some(deal => deal._id === dealId)) {
                // Move from available to my deals
                const acceptedDeal = availableDeals.find(deal => deal._id === dealId);
                acceptedDeal.status = 'Accepted';
                setAvailableDeals(availableDeals.filter(deal => deal._id !== dealId));
                setDeals([acceptedDeal, ...deals]);
            } else {
                // Just update status
                setDeals(deals.map(deal =>
                    deal._id === dealId ? { ...deal, status: 'Accepted' } : deal
                ));
            }
        } catch (err) {
            setError("Failed to accept deal: " + (err.response?.data?.message || err.message));
        }
    };

    // Handle a seller rejecting a deal
    const handleRejectDeal = async (dealId) => {
        try {
            await axios.put("/api/deals/status", { dealId, status: 'Rejected' });

            // Update local state
            if (availableDeals.some(deal => deal._id === dealId)) {
                // Remove from available deals if it was there
                setAvailableDeals(availableDeals.filter(deal => deal._id !== dealId));
            } else {
                // Just update status
                setDeals(deals.map(deal =>
                    deal._id === dealId ? { ...deal, status: 'Rejected' } : deal
                ));
            }
        } catch (err) {
            setError("Failed to reject deal: " + (err.response?.data?.message || err.message));
        }
    };

    // Deal card component
    const DealCard = ({ deal, isAvailable = false }) => (
        <div className="bg-white shadow rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold">{deal.title}</h3>
            <p className="text-gray-600 mb-2">{deal.description}</p>
            <div className="flex justify-between items-center">
                <span className="font-bold">${deal.price}</span>
                {!isAvailable && (
                    <span className={`px-2 py-1 rounded text-sm ${
                        deal.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                            deal.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                    }`}>
                        {deal.status}
                    </span>
                )}
            </div>

            {/* Buyer's name for deals (if buyer exists and component user is seller) */}
            {deal.buyer && isSeller && (
                <div className="mt-2 text-sm text-gray-500">
                    Buyer: {deal.buyer.name || 'Unknown Buyer'}
                </div>
            )}

            {/* Seller's name for deals (if seller exists and component user is buyer) */}
            {deal.seller && isBuyer && (
                <div className="mt-2 text-sm text-gray-500">
                    Seller: {deal.seller.name || 'Unknown Seller'}
                </div>
            )}

            {/* Accept/Reject buttons for seller on available deals */}
            {isSeller && isAvailable && (
                <div className="mt-4 flex space-x-2">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        onClick={() => handleAcceptDeal(deal._id)}
                    >
                        Accept
                    </button>
                    <button
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        onClick={() => handleRejectDeal(deal._id)}
                    >
                        Reject
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isBuyer ? 'My Purchase Requests' : 'My Seller Deals'}
                    </h2>
                    {isBuyer && (
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                            onClick={() => setFormVisible(!formVisible)}
                        >
                            {formVisible ? "Cancel" : "Create Deal Request"}
                        </button>
                    )}
                </div>

                {/* Deal Creation Form (Buyers Only) */}
                {formVisible && isBuyer && (
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <h3 className="text-xl font-semibold mb-4">Create New Deal Request</h3>
                        {formError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {formError}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2" htmlFor="title">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2" htmlFor="description">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    required
                                ></textarea>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2" htmlFor="price">
                                    Price ($)
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full"
                                disabled={submitting}
                            >
                                {submitting ? "Creating..." : "Create Deal Request"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* User's Deals Section */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold mb-4">
                        {isBuyer ? 'My Purchase Requests' : 'My Active Deals'}
                    </h3>

                    {/* Loading Indicator */}
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading deals...</p>
                        </div>
                    ) : (
                        <>
                            {/* Deals List */}
                            {deals.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-gray-600">You don't have any deals yet.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {deals.map((deal) => (
                                        <DealCard key={deal._id} deal={deal} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Available Deals Section (Sellers Only) */}
                {isSeller && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">Available Deal Requests</h3>

                        {availableDeals.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-gray-600">No available deal requests at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {availableDeals.map((deal) => (
                                    <DealCard key={deal._id} deal={deal} isAvailable={true} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Deals;