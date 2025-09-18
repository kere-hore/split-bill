interface SettlementPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SettlementPage({ params }: SettlementPageProps) {
  const { id } = await params;
  // TODO: Fetch bill data from database
  // const bill = await getBill(id);
  // if (!bill) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Split Bill Settlement</h1>
          <p className="text-muted-foreground">
            Add members and assign items to split the bill
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bill Summary */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Bill Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Bill ID:</span>
                  <span className="font-mono">{id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Merchant:</span>
                  <span>Loading...</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>Loading...</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>Loading...</span>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Items</h3>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  Loading items...
                </p>
              </div>
            </div>
          </div>

          {/* Settlement Actions */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Group Members</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Add people who shared this bill
                </p>
                {/* TODO: Add member management component */}
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">
                    Add members to start splitting
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Split Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Members:</span>
                  <span>0</span>
                </div>
                <div className="flex justify-between">
                  <span>Per Person:</span>
                  <span>-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
