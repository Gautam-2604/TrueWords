'use client'
import { useAuth } from "@/context/authContext";
import { Organization, ProcessedTestimonialForm } from "@/lib/types";
import { Copy, ExternalLink, Eye, FileText, MoreVertical, Plus, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const FormsDashboard = () => {
  const [selectedOrg, setSelectedOrg] = useState('');
  const [forms, setForms] = useState<ProcessedTestimonialForm[]>([]) // Initialize as empty array
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoadingForms, setIsLoadingForms] = useState(true);
  const navigate = useRouter()
  
  const { user,isLoading} = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setIsLoadingForms(false);
      return;
    }

    
    
    const getForms = async () => {
  try {
    const orgs = await fetch(`/api/organization?userId=${user.id}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json"
      }
    });
    const data = await orgs.json();
    setOrganizations(Array.isArray(data.orgs) ? data.orgs : []);
    setIsLoadingForms(true);
    const response = await fetch(`/api/forms?userId=${user.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('API Response:', responseData);
    
    let formsArray = [];
    
    if (responseData.data && Array.isArray(responseData.data)) {
      
      formsArray = responseData.data.reduce((allForms: any, orgData: { forms: any[]; organizationName: any; }) => {
        if (orgData.forms && Array.isArray(orgData.forms)) {
          const formsWithOrgName = orgData.forms.map((form: any) => ({
            ...form,
            organizationName: orgData.organizationName
          }));
          return [...allForms, ...formsWithOrgName];
        }
        return allForms;
      }, []);
    } else if (Array.isArray(responseData)) {
      // Handle if API returns direct array
      formsArray = responseData;
    } else {
      console.warn('Unexpected API response format:', responseData);
      formsArray = [];
    }
    
    console.log('Processed forms array:', formsArray);
    setForms(formsArray);
    
  } catch (error) {
    console.error('Error fetching forms:', error);
    setForms([]);
  } finally {
    setIsLoadingForms(false);
  }
};

    getForms();
  }, [user?.id, isLoading]);

  // Ensure forms is always an array before filtering
  const safeFormsArray = Array.isArray(forms) ? forms : [];
  
  const filteredForms = selectedOrg 
    ? safeFormsArray.filter(form => form.organizationId === selectedOrg)
    : safeFormsArray;

  // Debug: Log filtering results
  console.log('forms:', forms);
  console.log('safeFormsArray:', safeFormsArray);
  console.log('filteredForms:', filteredForms);
  console.log('selectedOrg:', selectedOrg);

  // Loading states
  if (isLoading || isLoadingForms) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }


  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please log in to view your forms.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | number | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcons = (types: any[]) => {
    if (!Array.isArray(types)) return '';
    
    const iconMap = {
      text: '📝',
      image: '🖼️',
      video: '🎥'
    };
    return types.map((type: string | number) => {
      if (typeof type === 'string' && type in iconMap) {
        return iconMap[type as keyof typeof iconMap];
      }
      return '❓';
    }).join(' ');
  };

  const copyEmbedCode = (slug: string) => {
    const embedCode = `<div id="testimonial-form-${slug}"></div>
<script src="https://your-domain.com/embed.js" data-form="${slug}"></script>`;
    navigator.clipboard.writeText(embedCode);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - same as before */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Forms</h1>
              <div className="text-sm text-muted-foreground">
                Manage your testimonial forms
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="org-select" className="text-sm font-medium text-foreground">
                  Organization:
                </label>
                <select
                  id="org-select"
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Organizations</option>
                  {organizations.map(org => (
                    <option key={org._id} value={org._id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                disabled={!selectedOrg}
                onClick={()=>navigate.push('/forms/create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Form
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedOrg && (
          <div className="mb-6 p-4 bg-muted/50 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 Select an organization above to create a new form, or view forms from all organizations below.
            </p>
          </div>
        )}

        {/* Forms Grid */}
        {filteredForms.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No forms found</h3>
            <p className="text-muted-foreground mb-6">
              {selectedOrg 
                ? "Create your first form for this organization" 
                : "Create your first testimonial form to get started"
              }
            </p>
            {selectedOrg && (
              <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Create First Form
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map(form => (
              <div key={form.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <button onClick={()=>navigate.push(`/forms/${form.slug}`)}>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {form.title}
                    </h3>
                    </button>
                    <p className="text-sm text-muted-foreground mb-2">
                      {form.organizationName}
                    </p>
                    {form.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {form.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${form.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <button className="p-1 hover:bg-muted rounded">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Types:</span>
                    <span className="font-medium">{getTypeIcons(form.allowedTypes)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Responses:</span>
                    <span className="font-medium text-foreground">{form.responsesCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium text-foreground">{formatDate(form.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button 
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm bg-muted hover:bg-muted/80 text-foreground rounded-md transition-colors"
                    onClick={() => copyEmbedCode(form.slug)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Embed
                  </button>
                  
                  <button className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm bg-muted hover:bg-muted/80 text-foreground rounded-md transition-colors">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  
                  <button className="p-2 hover:bg-muted rounded-md transition-colors">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </button>
                  
                  <button className="p-2 hover:bg-muted rounded-md transition-colors">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsDashboard