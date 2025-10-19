"use client";

import {
  Header,
  Navbar,
  Hero,
  Section,
  Container,
  Grid,
  Card,
  Text,
  Image,
  Video,
  Button,
  Form,
  Footer,
} from "@/components/builder";

export default function PreviewPage() {
  return (
    <div className="min-h-screen">
      {/* Header Component */}
      <Header sticky={true} shadow={true}>
        <Navbar
          logoText="Layr Preview"
          links={[
            { text: "Home", href: "#" },
            { text: "About", href: "#" },
            { text: "Services", href: "#" },
            { text: "Contact", href: "#" },
          ]}
          ctaText="Get Started"
          ctaLink="#"
        />
      </Header>

      {/* Hero Component */}
      <Hero
        title="Component Library Preview"
        subtitle="Layr Builder"
        description="Explore all the pre-built components available in the Layr website builder. Each component is fully responsive and customizable."
        primaryButtonText="Start Building"
        secondaryButtonText="Learn More"
        backgroundColor="#f8fafc"
        size="lg"
      />

      {/* Text Components Section */}
      <Section padding="lg" backgroundColor="#ffffff">
        <Container maxWidth="xl">
          <Text
            tag="h2"
            size="3xl"
            weight="bold"
            align="center"
            className="mb-8"
          >
            Text Components
          </Text>

          <Grid columns={2} gap="lg">
            <div className="space-y-4">
              <Text tag="h1" size="4xl" weight="bold">
                Heading 1
              </Text>
              <Text tag="h2" size="3xl" weight="semibold">
                Heading 2
              </Text>
              <Text tag="h3" size="2xl" weight="medium">
                Heading 3
              </Text>
              <Text tag="p" size="lg">
                Large paragraph text for important content.
              </Text>
              <Text tag="p" size="base">
                Regular paragraph text for body content.
              </Text>
            </div>
            <div className="space-y-4">
              <Text tag="p" size="sm" color="#6b7280">
                Small text for captions and notes.
              </Text>
              <Text tag="span" weight="bold" color="#dc2626">
                Bold red text
              </Text>
              <Text tag="p" align="center">
                Center aligned text
              </Text>
              <Text tag="p" align="right">
                Right aligned text
              </Text>
            </div>
          </Grid>
        </Container>
      </Section>

      {/* Button Components Section */}
      <Section padding="lg" backgroundColor="#f9fafb">
        <Container maxWidth="xl">
          <Text
            tag="h2"
            size="3xl"
            weight="bold"
            align="center"
            className="mb-8"
          >
            Button Components
          </Text>

          <Grid columns={3} gap="md">
            <Button text="Default Button" />
            <Button text="Primary Button" variant="default" />
            <Button text="Outline Button" variant="outline" />
            <Button text="Secondary Button" variant="secondary" />
            <Button text="Ghost Button" variant="ghost" />
            <Button text="Link Button" variant="link" />
            <Button text="Small Button" size="sm" />
            <Button text="Large Button" size="lg" />
            <Button text="Full Width" fullWidth={true} />
          </Grid>
        </Container>
      </Section>

      {/* Card Components Section */}
      <Section padding="lg" backgroundColor="#ffffff">
        <Container maxWidth="xl">
          <Text
            tag="h2"
            size="3xl"
            weight="bold"
            align="center"
            className="mb-8"
          >
            Card Components
          </Text>

          <Grid columns={3} gap="lg">
            <Card
              title="Default Card"
              description="This is a basic card with title and description."
              buttonText="Learn More"
              variant="default"
            />
            <Card
              title="Bordered Card"
              description="This card has a border for better definition."
              buttonText="View Details"
              variant="bordered"
            />
            <Card
              title="Shadow Card"
              description="This card has a subtle shadow effect."
              buttonText="Get Started"
              variant="shadow"
            />
            <Card
              title="Icon Card"
              description="This card features an icon instead of an image."
              icon="🚀"
              buttonText="Explore"
              variant="elevated"
            />
            <Card
              title="Image Card"
              description="This card includes a placeholder image."
              image="https://via.placeholder.com/400x200/3b82f6/ffffff?text=Image"
              buttonText="View Gallery"
              variant="shadow"
            />
            <Card
              title="Elevated Card"
              description="This card has enhanced shadow and hover effects."
              icon="⭐"
              buttonText="Premium"
              variant="elevated"
            />
          </Grid>
        </Container>
      </Section>

      {/* Image and Video Section */}
      <Section padding="lg" backgroundColor="#f9fafb">
        <Container maxWidth="xl">
          <Text
            tag="h2"
            size="3xl"
            weight="bold"
            align="center"
            className="mb-8"
          >
            Media Components
          </Text>

          <Grid columns={2} gap="lg">
            <div>
              <Text tag="h3" size="xl" weight="semibold" className="mb-4">
                Images
              </Text>
              <div className="space-y-4">
                <Image
                  src="https://via.placeholder.com/400x200/10b981/ffffff?text=Responsive+Image"
                  alt="Sample image"
                  rounded="lg"
                  className="w-full"
                />
                <Image
                  src="https://via.placeholder.com/150x150/f59e0b/ffffff?text=Square"
                  alt="Square image"
                  rounded="full"
                  className="mx-auto"
                />
              </div>
            </div>

            <div>
              <Text tag="h3" size="xl" weight="semibold" className="mb-4">
                Videos
              </Text>
              <Video
                youtubeId="dQw4w9WgXcQ"
                aspectRatio="16:9"
                className="mb-4"
              />
              <Video
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                controls={true}
                aspectRatio="16:9"
              />
            </div>
          </Grid>
        </Container>
      </Section>

      {/* Form Component Section */}
      <Section padding="lg" backgroundColor="#ffffff">
        <Container maxWidth="md">
          <Text
            tag="h2"
            size="3xl"
            weight="bold"
            align="center"
            className="mb-8"
          >
            Form Component
          </Text>

          <Form
            title="Contact Us"
            description="Fill out this form to get in touch with our team."
            fields={[
              {
                id: "name",
                type: "text",
                label: "Full Name",
                placeholder: "Enter your full name",
                required: true,
              },
              {
                id: "email",
                type: "email",
                label: "Email Address",
                placeholder: "Enter your email",
                required: true,
              },
              {
                id: "phone",
                type: "tel",
                label: "Phone Number",
                placeholder: "Enter your phone number",
              },
              {
                id: "subject",
                type: "select",
                label: "Subject",
                required: true,
                options: ["General Inquiry", "Support", "Sales", "Partnership"],
              },
              {
                id: "message",
                type: "textarea",
                label: "Message",
                placeholder: "Enter your message here...",
                required: true,
              },
              {
                id: "newsletter",
                type: "checkbox",
                label: "Subscribe to our newsletter",
              },
            ]}
            submitText="Send Message"
          />
        </Container>
      </Section>

      {/* Grid Layouts Section */}
      <Section padding="lg" backgroundColor="#f9fafb">
        <Container maxWidth="xl">
          <Text
            tag="h2"
            size="3xl"
            weight="bold"
            align="center"
            className="mb-8"
          >
            Grid Layouts
          </Text>

          <div className="space-y-8">
            <div>
              <Text tag="h3" size="xl" weight="semibold" className="mb-4">
                2 Column Grid
              </Text>
              <Grid columns={2} gap="md">
                <div className="bg-blue-100 p-6 rounded-lg text-center">
                  Column 1
                </div>
                <div className="bg-green-100 p-6 rounded-lg text-center">
                  Column 2
                </div>
              </Grid>
            </div>

            <div>
              <Text tag="h3" size="xl" weight="semibold" className="mb-4">
                3 Column Grid
              </Text>
              <Grid columns={3} gap="lg">
                <div className="bg-purple-100 p-6 rounded-lg text-center">
                  Column 1
                </div>
                <div className="bg-yellow-100 p-6 rounded-lg text-center">
                  Column 2
                </div>
                <div className="bg-pink-100 p-6 rounded-lg text-center">
                  Column 3
                </div>
              </Grid>
            </div>

            <div>
              <Text tag="h3" size="xl" weight="semibold" className="mb-4">
                4 Column Grid
              </Text>
              <Grid columns={4} gap="sm">
                <div className="bg-red-100 p-4 rounded-lg text-center text-sm">
                  Col 1
                </div>
                <div className="bg-blue-100 p-4 rounded-lg text-center text-sm">
                  Col 2
                </div>
                <div className="bg-green-100 p-4 rounded-lg text-center text-sm">
                  Col 3
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg text-center text-sm">
                  Col 4
                </div>
              </Grid>
            </div>
          </div>
        </Container>
      </Section>

      {/* Container Examples */}
      <Section padding="lg" backgroundColor="#ffffff">
        <Text tag="h2" size="3xl" weight="bold" align="center" className="mb-8">
          Container Components
        </Text>

        <div className="space-y-6">
          <Container
            maxWidth="sm"
            padding="md"
            className="bg-gray-100 rounded-lg"
          >
            <Text align="center">Small Container (max-w-sm)</Text>
          </Container>

          <Container
            maxWidth="md"
            padding="md"
            className="bg-gray-200 rounded-lg"
          >
            <Text align="center">Medium Container (max-w-md)</Text>
          </Container>

          <Container
            maxWidth="lg"
            padding="md"
            className="bg-gray-300 rounded-lg"
          >
            <Text align="center">Large Container (max-w-lg)</Text>
          </Container>

          <Container
            maxWidth="xl"
            padding="md"
            className="bg-gray-400 rounded-lg"
          >
            <Text align="center" color="white">
              Extra Large Container (max-w-xl)
            </Text>
          </Container>
        </div>
      </Section>

      {/* Footer Component */}
      <Footer
        logoText="Layr Builder"
        description="Build beautiful websites with our drag-and-drop builder. No coding required."
        sections={[
          {
            title: "Product",
            links: [
              { text: "Features", href: "#" },
              { text: "Templates", href: "#" },
              { text: "Pricing", href: "#" },
              { text: "API", href: "#" },
            ],
          },
          {
            title: "Company",
            links: [
              { text: "About", href: "#" },
              { text: "Blog", href: "#" },
              { text: "Careers", href: "#" },
              { text: "Contact", href: "#" },
            ],
          },
          {
            title: "Support",
            links: [
              { text: "Help Center", href: "#" },
              { text: "Documentation", href: "#" },
              { text: "Community", href: "#" },
              { text: "Status", href: "#" },
            ],
          },
        ]}
        socialLinks={[
          { platform: "Twitter", href: "#", icon: "🐦" },
          { platform: "GitHub", href: "#", icon: "🐙" },
          { platform: "LinkedIn", href: "#", icon: "💼" },
        ]}
        copyright="© 2024 Layr Builder. All rights reserved."
      />
    </div>
  );
}
