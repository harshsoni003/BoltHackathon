import React from 'react';
import CreateAgentForm from './CreateAgentForm';
import TalkWithBotButton from '@/components/landing/TalkWithBotButton';
import { useNavigate } from 'react-router-dom';

const CreateAgentPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-center">
          <CreateAgentForm showBackButton={true} />
        </div>
      </div>
      
      {/* ElevenLabs Widget */}
      <TalkWithBotButton onClick={() => {}} />
    </div>
  );
};

export default CreateAgentPage; 