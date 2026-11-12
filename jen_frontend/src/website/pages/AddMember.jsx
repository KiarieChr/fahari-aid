import React from "react";
import AddMember from "../components/AddMember";
import { useSearchParams } from "react-router-dom";

export default function AddMemberPage() {
    const [searchParams] = useSearchParams();
    const meetingId = searchParams.get("meeting_id");
    return <AddMember meetingId={meetingId} />;
}
